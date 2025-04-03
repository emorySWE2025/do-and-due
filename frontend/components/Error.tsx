import React from 'react'

interface ErrorProps {
  message: string;
  details?: string;
  className?: string;
  onClose?: () => void;
}

export default function Error({ 
  message, 
  details,
  className = '', 
  onClose
}: ErrorProps) {
  if (!message) return null;
  
  return (
    <div 
      className={`flex items-start border border-red-200 rounded-md p-5 
      text-black-600 bg-red-100 relative ${className}`}
    >
      <div>
        <p className="font-medium text-sm">{message}</p>
        {details && <p className="text-sm mt-1">{details}</p>}
      </div>
      
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-red-400 hover:text-red-600"
          aria-label="Close error message"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </div>
  )
}