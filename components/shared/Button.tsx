interface ButtonProps {
  type?: 'submit' | 'button'
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ type = 'button', disabled, children, onClick }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300"
    >
      {children}
    </button>
  )
}
