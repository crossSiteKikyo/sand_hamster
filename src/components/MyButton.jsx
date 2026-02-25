export default function MyButton({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-gray-400 dark:bg-gray-600 px-1 text-sm text-center ${className}`}
    >
      {children}
    </button>
  );
}
