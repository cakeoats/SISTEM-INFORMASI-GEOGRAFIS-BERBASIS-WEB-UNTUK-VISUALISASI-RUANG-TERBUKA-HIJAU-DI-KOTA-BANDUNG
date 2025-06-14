// frontend/src/utils/toast.js
import { toast } from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
    duration: 4000,
    position: 'top-right',
    style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        fontSize: '14px',
        maxWidth: '350px',
    },
};

// Toast utility functions
export const showToast = {
    success: (message) => {
        toast.success(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#10B981',
            },
            icon: '✅',
        });
    },

    error: (message) => {
        toast.error(message, {
            ...toastConfig,
            duration: 5000, // Error toast stays longer
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

    info: (message) => {
        toast(message, {
            ...toastConfig,
            style: {
                ...toastConfig.style,
                background: '#6B7280',
            },
            icon: 'ℹ️',
        });
    },

    warning: (message) => {
        toast(message, {
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
            toast.success(`File berhasil didownload: ${filename}`, {
                ...toastConfig,
                duration: 6000,
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
    }
};

// Toast provider setup for App.jsx
export const ToastProvider = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    ...toastConfig,
                    className: '',
                    success: {
                        duration: 4000,
                        theme: {
                            primary: '#10B981',
                            secondary: 'white',
                        },
                    },
                    error: {
                        duration: 5000,
                        theme: {
                            primary: '#EF4444',
                            secondary: 'white',
                        },
                    },
                }}
            />
        </>
    );
};