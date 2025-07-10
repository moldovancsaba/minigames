export interface ButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ 
  type = 'button', 
  disabled, 
  children, 
  onClick,
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm 
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        ${variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-300'}
        ${variant === 'secondary' && 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}
        ${variant === 'danger' && 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 disabled:bg-red-300'}
      `}
    >
      {children}
    </button>
  )
}
