<template>
  <v-app>
    <!-- Drawer Navigasi untuk Desktop (Permanent) -->
    <v-navigation-drawer 
      v-if="!isMobile && isLoggedIn"
      v-model="drawer" 
      app 
      permanent
      width="250"
      color="blue-grey-lighten-5"
    >
      <v-list-item class="pa-4">
        <v-list-item-title class="text-h6 font-weight-bold">
          Menu Aplikasi
        </v-list-item-title>
        <v-list-item-subtitle>
          Navigasi Cepat
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item @click="currentPage = 'attendance'" :class="{'bg-primary text-white': currentPage === 'attendance'}">
          <v-list-item-icon><v-icon>mdi-calendar-clock</v-icon></v-list-item-icon>
          <v-list-item-title>Absensi</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentPage = 'history'" :class="{'bg-primary text-white': currentPage === 'history'}">
          <v-list-item-icon><v-icon>mdi-history</v-icon></v-list-item-icon>
          <v-list-item-title>Riwayat Kehadiran</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" @click="currentPage = 'users'" :class="{'bg-primary text-white': currentPage === 'users'}">
          <v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon>
          <v-list-item-title>Manajemen User</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" color="red">
          <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
          <v-list-item-title>Keluar</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <!-- Drawer Navigasi untuk Mobile (Temporary/Geser) -->
    <v-navigation-drawer 
      v-else-if="isMobile && isLoggedIn"
      v-model="drawer" 
      app
    >
      <v-list dense nav>
        <v-list-item @click="currentPage = 'attendance'; drawer = false" :class="{'bg-primary text-white': currentPage === 'attendance'}">
          <v-list-item-icon><v-icon>mdi-calendar-clock</v-icon></v-list-item-icon>
          <v-list-item-title>Absensi</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentPage = 'history'; drawer = false" :class="{'bg-primary text-white': currentPage === 'history'}">
          <v-list-item-icon><v-icon>mdi-history</v-icon></v-list-item-icon>
          <v-list-item-title>Riwayat Kehadiran</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" @click="currentPage = 'users'; drawer = false" :class="{'bg-primary text-white': currentPage === 'users'}">
          <v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon>
          <v-list-item-title>Manajemen User</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" color="red">
          <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
          <v-list-item-title>Keluar</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <!-- Tampilkan Hamburger hanya jika Mobile dan sedang Login -->
      <v-app-bar-nav-icon 
        v-if="isMobile && isLoggedIn" 
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      
      <v-toolbar-title>Aplikasi Absensi WFH</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- Tampilkan tombol keluar hanya pada desktop, karena di mobile sudah ada di drawer -->
      <v-btn v-if="isLoggedIn && !isMobile" icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Konten Utama: Menggunakan padding-left dinamis untuk Desktop -->
    <v-main :style="mainContentStyle" class="bg-blue-grey-lighten-5">
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
                <v-btn color="success" class="mr-4" @click="openCamera('Masuk')" :loading="isCheckinLoading">
                  <v-icon left>mdi-login</v-icon>
                  Absen Masuk
                </v-btn>
                <v-btn color="red" @click="openCamera('Pulang')" :loading="isCheckoutLoading">
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
                <p><strong>Foto Kehadiran (Preview):</strong></p>
                <!-- photoPreviewUrl berisi Base64 Data URL -->
                <img :src="photoPreviewUrl" alt="Foto Kehadiran" class="w-full max-w-sm rounded-lg shadow-lg">
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Dialog Kamera -->
        <v-dialog v-model="cameraDialog" max-width="600px" persistent>
          <v-card>
            <v-card-title>Ambil Foto Kehadiran</v-card-title>
            <v-card-text>
              <!-- cameraVideo ref berada di sini -->
              <video ref="cameraVideo" autoplay playsinline class="w-full h-auto rounded-lg shadow-lg"></video>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red" text @click="closeCamera">Batal</v-btn>
              <v-btn color="success" @click="capturePhotoAndSave">Ambil Foto & Absen</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Dialog Penampil Foto (Baru) -->
        <v-dialog v-model="photoViewerDialog" max-width="600px">
          <v-card>
            <v-card-title>Foto Presensi</v-card-title>
            <v-card-text class="text-center">
              <img :src="currentPhotoUrl" alt="Foto Presensi Tersimpan" class="w-full h-auto rounded-lg shadow-lg">
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="photoViewerDialog = false">Tutup</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

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
              <v-data-table :headers="attendanceHeaders" :items="filteredAttendance" :search="search">
                <!-- Template untuk menampilkan foto di tabel -->
                <template v-slot:item.photoUrl="{ item }">
                  <v-btn 
                    v-if="item.photoUrl" 
                    color="primary" 
                    variant="tonal" 
                    size="small"
                    @click="viewPhoto(item.photoUrl)"
                  >
                    Lihat Foto
                  </v-btn>
                  <span v-else>Tidak Ada</span>
                </template>
              </v-data-table>
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
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'; 
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Konfigurasi Firebase Anda
// Pastikan konfigurasi ini dimuat di lingkungan Canvas
const __firebase_config = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ganti "YOUR_PROJECT_ID" dengan Project ID asli Anda dari Firebase Console
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; 

// ================================================================================================
// 2. STATE APLIKASI
// ================================================================================================
const drawer = ref(true); // Default true agar desktop mode langsung terbuka
const currentPage = ref('attendance');
const isLoggedIn = ref(false);
const isAdmin = ref(false);
const isRegistering = ref(false);
const email = ref('');
const password = ref('');
const nama = ref('');
const loginError = ref('');
const registerError = ref('');
const isLoginLoading = ref(false);
const isRegisterLoading = ref(false);
const user = ref(null);
const userProfile = ref(null);
const search = ref('');

// State Responsivitas (BARU)
const isMobile = ref(false);
const DRAWER_WIDTH = 250;
const MOBILE_BREAKPOINT = 960; // Standar Vuetify 'lg' breakpoint

// State untuk Kamera & Absensi
const isCheckinLoading = ref(false);
const isCheckoutLoading = ref(false);
const cameraDialog = ref(false);
const cameraVideo = ref(null);
const videoStream = ref(null);
const attendanceActionType = ref('');
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
  { title: 'Foto', key: 'photoUrl' }, 
];

// State untuk Penampil Foto 
const photoViewerDialog = ref(false);
const currentPhotoUrl = ref('');

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

// Style konten utama untuk menyeimbangkan drawer permanen (BARU)
const mainContentStyle = computed(() => {
  if (isLoggedIn.value && !isMobile.value) {
    return { 'padding-left': `${DRAWER_WIDTH}px` };
  }
  return {};
});

// ================================================================================================
// 3. FUNGSI OTENTIKASI & MANAJEMEN USER
// ================================================================================================
// Fungsi Pendeteksi Ukuran Layar (BARU)
const checkMobile = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
  // Jika berubah ke desktop, pastikan drawer tertutup agar tidak mengganggu layout
  if (!isMobile.value) {
    drawer.value = true;
  } else {
    // Di mobile, drawer harus dimulai tertutup
    drawer.value = false;
  }
};

onMounted(() => {
  // Setup Autentikasi
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      user.value = currentUser;
      isLoggedIn.value = true;
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
      if (isAdmin.value) {
        fetchUsers();
      }
    } else {
      isLoggedIn.value = false;
      isAdmin.value = false;
      user.value = null;
      userProfile.value = null;
    }
  });

  // Setup Responsivitas
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

// **HOOK VUE UNTUK CLEANUP**
onBeforeUnmount(() => {
  closeCamera();
  window.removeEventListener('resize', checkMobile); // Hapus listener saat komponen dilepas (BARU)
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

const register = async () => {
  isRegisterLoading.value = true;
  registerError.value = '';
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, `artifacts/${appId}/users`, uid), {
      nama: nama.value,
      email: email.value,
      isAdmin: false,
    });

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
      const userRef = doc(db, `artifacts/${appId}/users`, editedUser.value.id);
      await updateDoc(userRef, {
        nama: editedUser.value.nama,
        email: editedUser.value.email,
        isAdmin: editedUser.value.isAdmin,
      });
      if (editedUser.value.password) {
        // Implementasi perubahan password jika diperlukan
      }
    } else {
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
    // Mengganti alert() dengan pesan di konsol atau UI kustom
    console.error('Gagal menyimpan pengguna: ' + e.message); 
  } finally {
    isSavingUser.value = false;
  }
};

const deleteUser = async (item) => {
  // Mengganti confirm() dengan pesan di konsol atau UI kustom
  if (confirm(`Yakin ingin menghapus pengguna ${item.nama}?`)) { 
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users`, item.id));
      fetchUsers();
    } catch (e) {
      console.error("Gagal menghapus pengguna:", e);
      console.error('Gagal menghapus pengguna: ' + e.message);
    }
  }
};

// ================================================================================================
// 4. FUNGSI KAMERA & PENCATATAN KEHADIRAN
// ================================================================================================
const openCamera = async (type) => {
  attendanceActionType.value = type;
  attendanceMessage.value = '';
  photoPreviewUrl.value = '';
  location.value = null;

  try {
    // 1. BUKA DIALOG DULU agar elemen <video> terpasang di DOM
    cameraDialog.value = true;
    await nextTick();

    let stream;
    
    // Coba 1: Prioritaskan kamera depan ('user')
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user' 
            } 
        });
    } catch (e) {
        // Jika gagal karena perangkat tidak ditemukan (NotFoundError), coba kamera default
        if (e.name === 'NotFoundError') {
            console.warn('NotFoundError (Kamera Depan). Mencoba kamera default...');
            
            // Coba 2: Kamera default apa pun 
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: true 
            });
        } else {
            // Jika error lain (NotAllowedError, SecurityError), lemparkan error tersebut
            throw e;
        }
    }

    videoStream.value = stream;

    // 3. Pasang stream ke elemen video
    if (cameraVideo.value) {
        cameraVideo.value.srcObject = stream;
    } else {
        throw new Error("Elemen video kamera gagal dimuat setelah dialog dibuka.");
    }
    
  } catch (e) {
    // Tangani semua error kamera
    closeCamera(); // Tutup dialog jika gagal
    let errorMessage = '';
    if (e.name === 'NotAllowedError') {
        errorMessage = 'Akses kamera ditolak oleh pengguna atau sistem. Pastikan izin sudah diberikan.';
    } else if (e.name === 'NotFoundError') {
        errorMessage = 'Tidak ada perangkat kamera yang ditemukan di sistem Anda.';
    } else {
        errorMessage = 'Gagal mengakses kamera. Pastikan Anda menggunakan HTTPS. Detail error: ' + (e.name || e.message);
    }
    
    attendanceMessage.value = errorMessage;
    attendanceAlertType.value = 'error';
    console.error('Error saat mengakses kamera:', e);
  }
};

const closeCamera = () => {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop());
    videoStream.value = null;
  }
  cameraDialog.value = false;
};

const capturePhotoAndSave = async () => {
  if (!videoStream.value) {
    attendanceMessage.value = 'Kamera tidak aktif.';
    attendanceAlertType.value = 'error';
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.value.videoWidth;
  canvas.height = cameraVideo.value.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(cameraVideo.value, 0, 0, canvas.width, canvas.height);
  // Ini adalah Base64 Data URL, data gambar itu sendiri.
  const photoDataUrl = canvas.toDataURL('image/jpeg'); 
  
  photoPreviewUrl.value = photoDataUrl;
  
  // LOGGING: Konfirmasi bahwa Base64 URL dihasilkan
  console.log("Base64 Photo URL dihasilkan (panjang:", photoDataUrl.length, "). Siap disimpan.");

  closeCamera();

  // Memulai proses pencatatan absensi
  if (attendanceActionType.value === 'Masuk') {
    checkIn(photoDataUrl);
  } else if (attendanceActionType.value === 'Pulang') {
    checkOut(photoDataUrl);
  }
};

// Fungsi baru untuk melihat foto (memuat Base64)
const viewPhoto = (photoUrl) => {
  currentPhotoUrl.value = photoUrl;
  photoViewerDialog.value = true;
}

const checkIn = async (photoUrl) => {
  isCheckinLoading.value = true;
  try {
    const userLocation = await getLocation();
    const userName = userProfile.value?.nama || user.value.email;
    const userEmail = userProfile.value?.email || user.value.email;

    const record = {
      type: 'Masuk',
      userId: user.value.uid,
      userName: userName,
      userEmail: userEmail,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      photoUrl: photoUrl, // Menyimpan Base64 Data URL
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, `artifacts/${appId}/attendance`), record);
    attendanceMessage.value = 'Absen masuk berhasil! Foto presensi disimpan.';
    attendanceAlertType.value = 'success';
    fetchAttendanceRecords();
  } catch (e) {
    // Catatan: Jika Base64 terlalu panjang (> 1MB), Firestore akan menolak dan error ini muncul.
    attendanceMessage.value = `Gagal absen masuk. (Mungkin foto terlalu besar untuk disimpan): ${e.message}`;
    attendanceAlertType.value = 'error';
    console.error(e);
  } finally {
    isCheckinLoading.value = false;
  }
};

const checkOut = async (photoUrl) => {
  isCheckoutLoading.value = true;
  try {
    const userLocation = await getLocation();
    const userName = userProfile.value?.nama || user.value.email;
    const userEmail = userProfile.value?.email || user.value.email;

    const record = {
      type: 'Pulang',
      userId: user.value.uid,
      userName: userName,
      userEmail: userEmail,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      photoUrl: photoUrl, // Menyimpan Base64 Data URL
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, `artifacts/${appId}/attendance`), record);
    attendanceMessage.value = 'Absen pulang berhasil! Foto presensi disimpan.';
    attendanceAlertType.value = 'success';
    fetchAttendanceRecords();
  } catch (e) {
    attendanceMessage.value = `Gagal absen pulang. (Mungkin foto terlalu besar untuk disimpan): ${e.message}`;
    attendanceAlertType.value = 'error';
    console.error(e);
  } finally {
    isCheckoutLoading.value = false;
  }
};

const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Perbarui state lokasi agar terlihat di UI
          location.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(location.value);
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
    // Di Excel, kita hanya menunjukkan apakah foto ada atau tidak, bukan Base64-nya.
    item.photoUrl ? 'Ada (Base64 Disimpan)' : 'Tidak Ada'
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
    // Di PDF, kita hanya menunjukkan apakah foto ada atau tidak, bukan Base64-nya.
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
