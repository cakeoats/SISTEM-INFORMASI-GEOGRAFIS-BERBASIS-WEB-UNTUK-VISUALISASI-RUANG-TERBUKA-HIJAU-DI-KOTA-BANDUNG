// frontend/src/components/LoadingSkeletons.jsx
import React from 'react';

// Base skeleton component
const SkeletonBase = ({ className = "", children, ...props }) => (
    <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        {...props}
    >
        {children}
    </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 7 }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-gray-50">
                <tr>
                    {Array.from({ length: columns }).map((_, index) => (
                        <th key={index} className="px-4 py-3">
                            <SkeletonBase className="h-4 w-20" />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <td key={colIndex} className="px-4 py-3">
                                <SkeletonBase
                                    className={`h-4 ${colIndex === 0 ? 'w-8' :
                                            colIndex === 1 ? 'w-24' :
                                                'w-16'
                                        }`}
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Card skeleton
export const CardSkeleton = ({ showImage = false }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        {showImage && <SkeletonBase className="h-48 w-full mb-4" />}
        <SkeletonBase className="h-6 w-3/4 mb-2" />
        <SkeletonBase className="h-4 w-full mb-2" />
        <SkeletonBase className="h-4 w-2/3 mb-4" />
        <div className="flex space-x-2">
            <SkeletonBase className="h-8 w-20" />
            <SkeletonBase className="h-8 w-24" />
        </div>
    </div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
            <SkeletonBase className="w-8 h-8 rounded-full mr-4" />
            <div className="flex-1">
                <SkeletonBase className="h-4 w-20 mb-2" />
                <SkeletonBase className="h-8 w-16" />
            </div>
        </div>
    </div>
);

// Map skeleton
export const MapSkeleton = () => (
    <div className="h-full w-full relative bg-gray-100">
        <SkeletonBase className="h-full w-full" />

        {/* Map controls skeleton */}
        <div className="absolute top-4 left-4">
            <SkeletonBase className="h-20 w-60 mb-4" />
        </div>

        {/* Legend skeleton */}
        <div className="absolute bottom-4 right-4">
            <SkeletonBase className="h-32 w-48" />
        </div>

        {/* Loading text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat peta...</p>
            </div>
        </div>
    </div>
);

// Dashboard grid skeleton
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <SkeletonBase className="h-8 w-48" />
            <SkeletonBase className="h-10 w-32" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <StatsCardSkeleton key={index} />
            ))}
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>
    </div>
);

// Form skeleton
export const FormSkeleton = () => (
    <div className="space-y-4">
        <SkeletonBase className="h-6 w-32 mb-2" />

        {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
                <SkeletonBase className="h-4 w-24 mb-1" />
                <SkeletonBase className="h-10 w-full" />
            </div>
        ))}

        <div className="flex justify-end space-x-3 pt-4">
            <SkeletonBase className="h-10 w-20" />
            <SkeletonBase className="h-10 w-24" />
        </div>
    </div>
);

// Data page specific skeleton
export const DataPageSkeleton = () => (
    <div className="container mx-auto px-4 py-6">
        {/* Dashboard stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <StatsCardSkeleton key={index} />
            ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                        <SkeletonBase className="h-4 w-20 mb-1" />
                        <SkeletonBase className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
                <SkeletonBase className="h-6 w-64" />
            </div>
            <TableSkeleton rows={8} columns={7} />
        </div>
    </div>
);

// List item skeleton
export const ListItemSkeleton = () => (
    <div className="flex items-center p-4 border-b border-gray-200">
        <SkeletonBase className="w-10 h-10 rounded-full mr-4" />
        <div className="flex-1">
            <SkeletonBase className="h-4 w-32 mb-1" />
            <SkeletonBase className="h-3 w-48" />
        </div>
        <SkeletonBase className="h-8 w-16" />
    </div>
);

// Generic page skeleton
export const PageSkeleton = ({ showHeader = true, showSidebar = false }) => (
    <div className="min-h-screen bg-gray-50">
        {showHeader && (
            <header className="bg-white shadow-sm border-b border-gray-200 p-4">
                <SkeletonBase className="h-8 w-48" />
            </header>
        )}

        <div className="flex">
            {showSidebar && (
                <aside className="w-64 bg-white shadow-sm p-4">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonBase key={index} className="h-8 w-full" />
                        ))}
                    </div>
                </aside>
            )}

            <main className="flex-1 p-6">
                <DashboardSkeleton />
            </main>
        </div>
    </div>
);

export default {
    TableSkeleton,
    CardSkeleton,
    StatsCardSkeleton,
    MapSkeleton,
    DashboardSkeleton,
    FormSkeleton,
    DataPageSkeleton,
    ListItemSkeleton,
    PageSkeleton,
};