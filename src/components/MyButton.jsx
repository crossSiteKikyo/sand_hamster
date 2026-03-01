export default function MyButton({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-gray-400 px-1 text-center text-sm dark:bg-gray-600 ${className}`}
    >
      {children}
    </button>
  );
}
