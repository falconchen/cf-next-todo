'use client'

import React from 'react'
import { Toaster, toast } from 'react-hot-toast'

export const ToastContainer = () => {
  return <Toaster position="top-right" />
}

export const useNotification = () => {
  const showNotification = React.useCallback((message, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      default:
        toast(message)
    }
  }, [])

  return showNotification
}