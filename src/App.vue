<template>
  <v-app>
    <!-- Drawer Navigasi -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item @click="currentPage = 'attendance'">
          <v-list-item-title>Absensi</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentPage = 'history'">
          <v-list-item-title>Riwayat Kehadiran</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" @click="currentPage = 'users'">
          <v-list-item-title>Manajemen User</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>Keluar</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Aplikasi Absensi WFH</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isLoggedIn" icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Konten Utama -->
    <v-main class="bg-blue-grey-lighten-5">
      <v-container fluid>
        <!-- Halaman Login/Register -->
        <v-card v-if="!isLoggedIn" class="mx-auto my-12" max-width="400">
          <v-card-title class="text-h5 text-center">{{ isRegistering ? 'Daftar Akun Baru' : 'Login' }}</v-card-title>
          <v-card-text>
            <!-- Form Login -->
            <v-form v-if="!isRegistering" @submit.prevent="login">
              <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
              <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
              <v-btn type="submit" color="primary" block class="mt-4" :loading="isLoginLoading">Masuk</v-btn>
              <div v-if="loginError" class="text-red-500 text-center mt-2">{{ loginError }}</div>
              <div class="text-center mt-4">
                Belum punya akun?
                <v-btn
                  variant="text"
                  color="primary"
                  @click="isRegistering = true"
                  class="font-weight-bold custom-link-button"
                >
                  Daftar di sini
                </v-btn>
              </div>
            </v-form>

            <!-- Form Pendaftaran -->
            <v-form v-else @submit.prevent="register">
              <v-text-field v-model="nama" label="Nama Lengkap" required></v-text-field>
              <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
              <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
              <v-btn type="submit" color="success" block class="mt-4" :loading="isRegisterLoading">Daftar</v-btn>
              <div v-if="registerError" class="text-red-500 text-center mt-2">{{ registerError }}</div>
              <div class="text-center mt-4">
                Sudah punya akun?
                <v-btn
                  variant="text"
                  color="primary"
                  @click="isRegistering = false"
                  class="font-weight-bold custom-link-button"
                >
                  Masuk di sini
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Halaman Absensi -->
        <div v-if="isLoggedIn && currentPage === 'attendance'" class="my-12">
          <v-card class="mx-auto" max-width="800">
            <v-card-title class="text-h5">Catat Kehadiran</v-card-title>
            <v-card-text>
              <div class="text-center my-4">
                <v-btn color="success" class="mr-4" @click="checkIn" :loading="isCheckinLoading">
                  <v-icon left>mdi-login</v-icon>
                  Absen Masuk
                </v-btn>
                <v-btn color="red" @click="checkOut" :loading="isCheckoutLoading">
                  <v-icon left>mdi-logout</v-icon>
                  Absen Pulang
                </v-btn>
              </div>
              <v-alert v-if="attendanceMessage" :type="attendanceAlertType" class="mt-4">{{ attendanceMessage }}</v-alert>
              <div v-if="location" class="mt-4">
                <p><strong>Lokasi Anda:</strong></p>
                <p>Garis Lintang: {{ location.lat }}</p>
                <p>Garis Bujur: {{ location.lng }}</p>
              </div>
              <div v-if="photoPreviewUrl" class="mt-4 text-center">
                <p><strong>Foto Kehadiran:</strong></p>
                <img :src="photoPreviewUrl" alt="Foto Kehadiran" class="w-full max-w-sm rounded-lg shadow-lg">
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Halaman Riwayat Kehadiran -->
        <div v-if="isLoggedIn && currentPage === 'history'" class="my-12">
          <v-card class="mx-auto" max-width="1200">
            <v-card-title class="text-h5">Riwayat Kehadiran</v-card-title>
            <v-card-actions class="d-flex justify-end">
              <v-btn color="success" class="mr-2" @click="exportToExcel(filteredAttendance, 'Riwayat Kehadiran')">
                <v-icon left>mdi-file-excel</v-icon>
                Ekspor Excel
              </v-btn>
              <v-btn color="red" @click="exportToPdf(filteredAttendance, 'Riwayat Kehadiran')">
                <v-icon left>mdi-file-pdf-box</v-icon>
                Ekspor PDF
              </v-btn>
            </v-card-actions>
            <v-card-text>
              <v-text-field v-model="search" label="Cari..." prepend-inner-icon="mdi-magnify" clearable></v-text-field>
              <v-data-table :headers="attendanceHeaders" :items="filteredAttendance" :search="search"></v-data-table>
            </v-card-text>
          </v-card>
        </div>

        <!-- Halaman Manajemen Pengguna (Admin) -->
        <div v-if="isLoggedIn && isAdmin && currentPage === 'users'" class="my-12">
          <v-card class="mx-auto" max-width="1200">
            <v-card-title class="text-h5">Manajemen Pengguna</v-card-title>
            <v-card-actions class="d-flex justify-end">
              <v-btn color="primary" @click="openUserDialog({})">
                <v-icon left>mdi-plus</v-icon>
                Tambah Pengguna
              </v-btn>
            </v-card-actions>
            <v-card-text>
              <v-data-table :headers="userHeaders" :items="users">
                <template v-slot:item.isAdmin="{ item }">
                  <v-chip :color="item.isAdmin ? 'green' : 'grey'" small dark>{{ item.isAdmin ? 'Admin' : 'User' }}</v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon small class="mr-2" @click="openUserDialog(item)">mdi-pencil</v-icon>
                  <v-icon small @click="deleteUser(item)">mdi-delete</v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>

        <!-- Dialog CRUD Pengguna -->
        <v-dialog v-model="userDialog" max-width="500px">
          <v-card>
            <v-card-title class="text-h6">{{ userFormTitle }}</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="saveUser">
                <v-text-field v-model="editedUser.nama" label="Nama" required></v-text-field>
                <v-text-field v-model="editedUser.email" label="Email" type="email" required></v-text-field>
                <v-text-field v-model="editedUser.password" label="Password" type="password" required></v-text-field>
                <v-checkbox v-model="editedUser.isAdmin" label="Admin"></v-checkbox>
                <v-btn type="submit" color="primary" class="mt-4" :loading="isSavingUser">Simpan</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// ================================================================================================
// 1. IMPOR & KONFIGURASI
// ================================================================================================
import { ref, onMounted, computed } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Konfigurasi Firebase Anda
import { auth, db } from './firebase/config.js';

// Ganti "YOUR_PROJECT_ID" dengan Project ID asli Anda dari Firebase Console
const appId = "aplikasi-absensi-37462"; 

// ================================================================================================
// 2. STATE APLIKASI
// ================================================================================================
const drawer = ref(false);
const currentPage = ref('attendance');
const isLoggedIn = ref(false);
const isAdmin = ref(false);
const isRegistering = ref(false); // State baru untuk beralih antara login dan register
const email = ref('');
const password = ref('');
const nama = ref(''); // State baru untuk nama
const loginError = ref('');
const registerError = ref('');
const isLoginLoading = ref(false);
const isRegisterLoading = ref(false);
const user = ref(null);
const userProfile = ref(null); // State baru untuk menyimpan profil pengguna yang sedang login
const search = ref('');

// State untuk CRUD Pengguna
const userDialog = ref(false);
const users = ref([]);
const editedUser = ref({});
const defaultUser = { nama: '', email: '', password: '', isAdmin: false };
const isSavingUser = ref(false);
const userHeaders = [
  { title: 'Nama', key: 'nama' },
  { title: 'Email', key: 'email' },
  { title: 'Peran', key: 'isAdmin' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

// State untuk Absensi
const isCheckinLoading = ref(false);
const isCheckoutLoading = ref(false);
const location = ref(null);
const photoPreviewUrl = ref('');
const attendanceMessage = ref('');
const attendanceAlertType = ref('info');
const attendanceRecords = ref([]);
const attendanceHeaders = [
  { title: 'Nama Lengkap', key: 'userName' },
  { title: 'Email', key: 'userEmail' },
  { title: 'Jenis', key: 'type' },
  { title: 'Tanggal', key: 'timestamp', value: (item) => formatTimestamp(item.timestamp) },
  { title: 'Lokasi (Lintang)', key: 'latitude' },
  { title: 'Lokasi (Bujur)', key: 'longitude' },
  { title: 'Foto', key: 'photoUrl', value: (item) => item.photoUrl ? 'Ada' : 'Tidak Ada' },
];

// Computed Properties
const userFormTitle = computed(() => editedUser.value.id ? 'Edit Pengguna' : 'Tambah Pengguna');
const filteredAttendance = computed(() => {
  if (!search.value) return attendanceRecords.value;
  const lowerSearch = search.value.toLowerCase();
  return attendanceRecords.value.filter(record =>
    (record.userName && record.userName.toLowerCase().includes(lowerSearch)) ||
    (record.type && record.type.toLowerCase().includes(lowerSearch)) ||
    (record.userEmail && record.userEmail.toLowerCase().includes(lowerSearch))
  );
});

// ================================================================================================
// 3. FUNGSI OTENTIKASI & MANAJEMEN USER
// ================================================================================================
onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      user.value = currentUser;
      isLoggedIn.value = true;
      // Ambil peran pengguna dan nama dari Firestore
      try {
        const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          userProfile.value = userDocSnap.data();
          isAdmin.value = userProfile.value.isAdmin || false;
        }
      } catch (e) {
        console.error("Gagal mendapatkan data user:", e);
      }
      fetchAttendanceRecords();
    } else {
      isLoggedIn.value = false;
      isAdmin.value = false;
      user.value = null;
      userProfile.value = null;
    }
  });
});

const login = async () => {
  isLoginLoading.value = true;
  loginError.value = '';
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    loginError.value = 'Login gagal: ' + e.message;
    console.error(e);
  } finally {
    isLoginLoading.value = false;
  }
};

// Fungsi Pendaftaran
const register = async () => {
  isRegisterLoading.value = true;
  registerError.value = '';
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const uid = userCredential.user.uid;

    // Simpan data user tambahan ke Firestore
    await setDoc(doc(db, `artifacts/${appId}/users`, uid), {
      nama: nama.value,
      email: email.value,
      isAdmin: false, // Default: user baru bukan admin
    });

    // Reset form
    email.value = '';
    password.value = '';
    nama.value = '';
    isRegistering.value = false;
  } catch (e) {
    registerError.value = 'Pendaftaran gagal: ' + e.message;
    console.error(e);
  } finally {
    isRegisterLoading.value = false;
  }
};


const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Gagal keluar:", e);
  }
};

// CRUD Pengguna (Hanya Admin)
const fetchUsers = async () => {
  const querySnapshot = await getDocs(collection(db, `artifacts/${appId}/users`));
  users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const openUserDialog = (item) => {
  editedUser.value = item.id ? { ...item, password: '' } : { ...defaultUser };
  userDialog.value = true;
};

const saveUser = async () => {
  isSavingUser.value = true;
  try {
    if (editedUser.value.id) {
      // Edit Pengguna
      const userRef = doc(db, `artifacts/${appId}/users`, editedUser.value.id);
      await updateDoc(userRef, {
        nama: editedUser.value.nama,
        email: editedUser.value.email,
        isAdmin: editedUser.value.isAdmin,
      });
      // Perbarui password jika ada
      if (editedUser.value.password) {
        // Ini adalah langkah yang rumit. Anda tidak bisa mengubah password pengguna lain langsung.
        // Untuk demo, kita akan lewati. Di produksi, Anda memerlukan cloud function.
      }
    } else {
      // Tambah Pengguna
      await createUserWithEmailAndPassword(auth, editedUser.value.email, editedUser.value.password);
      const newUser = {
        nama: editedUser.value.nama,
        email: editedUser.value.email,
        isAdmin: editedUser.value.isAdmin,
      };
      await addDoc(collection(db, `artifacts/${appId}/users`), newUser);
    }
    fetchUsers();
    userDialog.value = false;
  } catch (e) {
    console.error("Gagal menyimpan pengguna:", e);
    alert('Gagal menyimpan pengguna: ' + e.message);
  } finally {
    isSavingUser.value = false;
  }
};

const deleteUser = async (item) => {
  if (confirm(`Yakin ingin menghapus pengguna ${item.nama}?`)) {
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users`, item.id));
      fetchUsers();
    } catch (e) {
      console.error("Gagal menghapus pengguna:", e);
      alert('Gagal menghapus pengguna: ' + e.message);
    }
  }
};

// ================================================================================================
// 4. FUNGSI PENCATATAN KEHADIRAN & PULANG
// ================================================================================================
const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
          console.error('Error saat mendapatkan lokasi:', error);
        }
      );
    } else {
      reject('Geolocation tidak didukung oleh browser ini.');
    }
  });
};

const takePhoto = async () => {
  // Simulasi pengambilan foto karena memerlukan Firebase Storage
  return new Promise((resolve) => {
    // Di lingkungan nyata, ini akan mengambil foto dan mengunggahnya ke Firebase Storage
    console.log("Mengambil foto...");
    const dummyPhoto = 'https://placehold.co/600x400/png?text=Foto Kehadiran';
    photoPreviewUrl.value = dummyPhoto;
    resolve(dummyPhoto);
  });
};

const checkIn = async () => {
  isCheckinLoading.value = true;
  attendanceMessage.value = '';
  attendanceAlertType.value = 'info';

  try {
    const userLocation = await getLocation();
    const photoUrl = await takePhoto();
    
    // Gunakan nama lengkap dan email dari userProfile
    const userName = userProfile.value?.nama || user.value.email;
    const userEmail = userProfile.value?.email || user.value.email;

    const record = {
      type: 'Masuk',
      userId: user.value.uid,
      userName: userName,
      userEmail: userEmail, // Menambahkan email ke record absensi
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      photoUrl: photoUrl,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, `artifacts/${appId}/attendance`), record);
    attendanceMessage.value = 'Absen masuk berhasil!';
    attendanceAlertType.value = 'success';
    fetchAttendanceRecords();
  } catch (e) {
    attendanceMessage.value = `Gagal absen masuk: ${e.message}`;
    attendanceAlertType.value = 'error';
    console.error(e);
  } finally {
    isCheckinLoading.value = false;
  }
};

const checkOut = async () => {
  isCheckoutLoading.value = true;
  attendanceMessage.value = '';
  attendanceAlertType.value = 'info';

  try {
    const userLocation = await getLocation();
    const photoUrl = await takePhoto();
    
    // Gunakan nama lengkap dan email dari userProfile
    const userName = userProfile.value?.nama || user.value.email;
    const userEmail = userProfile.value?.email || user.value.email;

    const record = {
      type: 'Pulang',
      userId: user.value.uid,
      userName: userName,
      userEmail: userEmail, // Menambahkan email ke record absensi
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      photoUrl: photoUrl,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, `artifacts/${appId}/attendance`), record);
    attendanceMessage.value = 'Absen pulang berhasil!';
    attendanceAlertType.value = 'success';
    fetchAttendanceRecords();
  } catch (e) {
    attendanceMessage.value = `Gagal absen pulang: ${e.message}`;
    attendanceAlertType.value = 'error';
    console.error(e);
  } finally {
    isCheckoutLoading.value = false;
  }
};

const fetchAttendanceRecords = async () => {
  try {
    const q = query(collection(db, `artifacts/${appId}/attendance`));
    const querySnapshot = await getDocs(q);
    attendanceRecords.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Gagal mengambil riwayat kehadiran:", e);
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Tidak ada data';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString('id-ID');
  }
  return new Date(timestamp).toLocaleString('id-ID');
};

// ================================================================================================
// 5. FUNGSI EKSPOR PDF & EXCEL
// ================================================================================================
const exportToExcel = (data, filename) => {
  const headers = attendanceHeaders.map(h => h.title);
  const rows = data.map(item => [
    item.userName,
    item.userEmail,
    item.type,
    formatTimestamp(item.timestamp),
    item.latitude,
    item.longitude,
    item.photoUrl ? 'Ada' : 'Tidak Ada'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportToPdf = (data, filename) => {
  const doc = new jsPDF();
  const headersPdf = attendanceHeaders.map(h => h.title);
  const rows = data.map(item => [
    item.userName,
    item.userEmail,
    item.type,
    formatTimestamp(item.timestamp),
    item.latitude,
    item.longitude,
    item.photoUrl ? 'Ada' : 'Tidak Ada'
  ]);
  
  doc.text(filename, 14, 16);
  autoTable(doc, {
    head: [headersPdf],
    body: rows,
    startY: 20
  });
  doc.save(`${filename}.pdf`);
};
</script>
<style>
/* Vuetify secara otomatis menyertakan banyak gaya. Tambahkan gaya kustom di sini jika diperlukan. */
.v-container {
  max-width: 100%;
}
</style>

