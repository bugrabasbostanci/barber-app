/**
 * usePagination hook for managing pagination state and logic
 */

'use client';

import { useState, useMemo, useCallback } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  siblingCount?: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

export interface PaginationRange {
  pages: (number | 'dots')[];
  showFirstPage: boolean;
  showLastPage: boolean;
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems = 0,
    siblingCount = 1
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItemsState, setTotalItemsState] = useState(totalItems);

  const state: PaginationState = useMemo(() => {
    const totalPages = Math.ceil(totalItemsState / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItemsState);

    return {
      currentPage,
      pageSize,
      totalItems: totalItemsState,
      totalPages,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [currentPage, pageSize, totalItemsState]);

  const actions: PaginationActions = useMemo(() => ({
    goToPage: (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, state.totalPages));
      setCurrentPage(clampedPage);
    },
    nextPage: () => {
      if (state.hasNext) {
        setCurrentPage(prev => prev + 1);
      }
    },
    previousPage: () => {
      if (state.hasPrevious) {
        setCurrentPage(prev => prev - 1);
      }
    },
    firstPage: () => {
      setCurrentPage(1);
    },
    lastPage: () => {
      setCurrentPage(state.totalPages);
    },
    setPageSize: (size: number) => {
      setPageSize(size);
      // Adjust current page if necessary
      const newTotalPages = Math.ceil(totalItemsState / size);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    },
    setTotalItems: (total: number) => {
      setTotalItemsState(total);
      // Adjust current page if necessary
      const newTotalPages = Math.ceil(total / pageSize);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    }
  }), [state.totalPages, state.hasNext, state.hasPrevious, totalItemsState, pageSize, currentPage]);

  const paginationRange: PaginationRange = useMemo(() => {
    const totalPages = state.totalPages;
    const current = currentPage;
    
    // If total pages is less than or equal to 7, show all pages
    if (totalPages <= 7) {
      return {
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
        showFirstPage: false,
        showLastPage: false
      };
    }

    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const pages: (number | 'dots')[] = [];

    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Case 1: No left dots, show right dots
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      pages.push(...leftRange, 'dots', totalPages);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Case 2: Show left dots, no right dots
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      pages.push(1, 'dots', ...rightRange);
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Case 3: Show both left and right dots
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      pages.push(1, 'dots', ...middleRange, 'dots', totalPages);
    } else {
      // Case 4: No dots needed (shouldn't happen with totalPages > 7)
      pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    }

    return {
      pages,
      showFirstPage: pages[0] !== 1,
      showLastPage: pages[pages.length - 1] !== totalPages
    };
  }, [currentPage, state.totalPages, siblingCount]);

  // Utility functions for data slicing
  const getPageData = useCallback(<T>(data: T[]): T[] => {
    return data.slice(state.startIndex, state.endIndex);
  }, [state.startIndex, state.endIndex]);

  const getOffsetLimit = useCallback(() => ({
    offset: state.startIndex,
    limit: pageSize
  }), [state.startIndex, pageSize]);

  // Reset pagination when dependencies change
  const reset = useCallback((newOptions?: Partial<PaginationOptions>) => {
    if (newOptions?.initialPage !== undefined) {
      setCurrentPage(newOptions.initialPage);
    }
    if (newOptions?.initialPageSize !== undefined) {
      setPageSize(newOptions.initialPageSize);
    }
    if (newOptions?.totalItems !== undefined) {
      setTotalItemsState(newOptions.totalItems);
    }
  }, []);

  return {
    ...state,
    ...actions,
    paginationRange,
    getPageData,
    getOffsetLimit,
    reset
  };
}

// Hook for server-side pagination
export function useServerPagination(options: PaginationOptions & {
  onPageChange?: (page: number, pageSize: number) => void;
} = {}) {
  const { onPageChange, ...paginationOptions } = options;
  const pagination = usePagination(paginationOptions);

  const goToPage = useCallback((page: number) => {
    pagination.goToPage(page);
    onPageChange?.(page, pagination.pageSize);
  }, [pagination, onPageChange]);

  const setPageSize = useCallback((size: number) => {
    pagination.setPageSize(size);
    onPageChange?.(1, size); // Reset to first page when changing page size
  }, [pagination, onPageChange]);

  return {
    ...pagination,
    goToPage,
    setPageSize,
    nextPage: () => {
      if (pagination.hasNext) {
        goToPage(pagination.currentPage + 1);
      }
    },
    previousPage: () => {
      if (pagination.hasPrevious) {
        goToPage(pagination.currentPage - 1);
      }
    },
    firstPage: () => goToPage(1),
    lastPage: () => goToPage(pagination.totalPages)
  };
}

// Hook for infinite scroll pagination
export function useInfinitePagination(options: PaginationOptions & {
  onLoadMore?: (page: number, pageSize: number) => void;
} = {}) {
  const { onLoadMore, ...paginationOptions } = options;
  const [isLoading, setIsLoading] = useState(false);
  const pagination = usePagination(paginationOptions);

  const loadMore = useCallback(async () => {
    if (pagination.hasNext && !isLoading) {
      setIsLoading(true);
      try {
        onLoadMore?.(pagination.currentPage + 1, pagination.pageSize);
        pagination.nextPage();
      } finally {
        setIsLoading(false);
      }
    }
  }, [pagination.hasNext, pagination.currentPage, pagination.pageSize, isLoading, onLoadMore, pagination.nextPage]);

  return {
    ...pagination,
    isLoading,
    loadMore,
    canLoadMore: pagination.hasNext && !isLoading
  };
}