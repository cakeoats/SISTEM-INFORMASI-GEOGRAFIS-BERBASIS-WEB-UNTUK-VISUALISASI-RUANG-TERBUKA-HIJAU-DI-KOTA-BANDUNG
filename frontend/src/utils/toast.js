// frontend/src/utils/toast.js - FIXED VERSION dengan durasi lebih pendek dan pencegahan duplikasi
import { toast, Toaster } from 'react-hot-toast';

// Custom toast configurations dengan durasi yang lebih pendek
const toastConfig = {
    duration: 2000, // Diperpendek dari 4000ms ke 2000ms (2 detik)
    position: 'top-right',
    style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        fontSize: '14px',
        maxWidth: '350px',
    },
};

// Track recent toasts to prevent duplicates
const recentToasts = new Map();

// Helper function to check for duplicate toasts
const isDuplicateToast = (message, type) => {
    const key = `${type}:${message}`;
    const now = Date.now();

    if (recentToasts.has(key)) {
        const lastTime = recentToasts.get(key);
        // Prevent same toast within 3 seconds
        if (now - lastTime < 3000) {
            return true;
        }
    }

    recentToasts.set(key, now);

    // Clean up old entries (older than 5 seconds)
    for (const [k, time] of recentToasts.entries()) {
        if (now - time > 5000) {
            recentToasts.delete(k);
        }
    }

    return false;
};

// Toast utility functions
export const showToast = {
    success: (message, skipDuplicateCheck = false) => {
        if (!skipDuplicateCheck && isDuplicateToast(message, 'success')) {
            console.log('Duplicate toast prevented:', message);
            return;
        }

        return toast.success(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#10B981',
            },
            icon: '✅',
        });
    },

    error: (message, skipDuplicateCheck = false) => {
        if (!skipDuplicateCheck && isDuplicateToast(message, 'error')) {
            console.log('Duplicate error toast prevented:', message);
            return;
        }

        return toast.error(message, {
            ...toastConfig,
            duration: 3000, // Error toast sedikit lebih lama
            style: {
                ...toastConfig.style,
                background: '#EF4444',
            },
            icon: '❌',
        });
    },

    loading: (message) => {
        return toast.loading(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#3B82F6',
            },
        });
    },

    info: (message, skipDuplicateCheck = false) => {
        if (!skipDuplicateCheck && isDuplicateToast(message, 'info')) {
            console.log('Duplicate info toast prevented:', message);
            return;
        }

        return toast(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#6B7280',
            },
            icon: 'ℹ️',
        });
    },

    warning: (message, skipDuplicateCheck = false) => {
        if (!skipDuplicateCheck && isDuplicateToast(message, 'warning')) {
            console.log('Duplicate warning toast prevented:', message);
            return;
        }

        return toast(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#F59E0B',
            },
            icon: '⚠️',
        });
    },

    // Custom toast for download progress
    download: {
        start: () => {
            return toast.loading('Memproses download...', {
                ...toastConfig,
                style: {
                    ...toastConfig.style,
                    background: '#8B5CF6',
                },
                icon: '📥',
            });
        },

        success: (filename) => {
            return toast.success(`File berhasil didownload: ${filename}`, {
                ...toastConfig,
                duration: 3000, // Download success toast lebih lama
                style: {
                    ...toastConfig.style,
                    background: '#10B981',
                },
                icon: '📄',
            });
        }
    },

    // Custom toast for data operations
    data: {
        saved: () => showToast.success('Data berhasil disimpan'),
        updated: () => showToast.success('Data berhasil diperbarui'),
        deleted: () => showToast.success('Data berhasil dihapus'),
        uploaded: (count) => showToast.success(`${count} data berhasil diupload`),
        loadError: () => showToast.error('Gagal memuat data. Silakan refresh halaman.'),
        saveError: () => showToast.error('Gagal menyimpan data. Silakan coba lagi.'),
        networkError: () => showToast.error('Koneksi bermasalah. Periksa internet Anda.'),
    },

    // Promise-based toast for async operations
    promise: (promise, messages) => {
        return toast.promise(promise, {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: messages.error || 'Something went wrong!',
        }, toastConfig);
    },

    // Utility functions
    dismiss: (toastId) => {
        return toast.dismiss(toastId);
    },

    remove: (toastId) => {
        return toast.remove(toastId);
    },

    // Clear all toasts
    dismissAll: () => {
        return toast.dismiss();
    }
};

// Export Toaster component untuk digunakan di App.jsx
export { Toaster };