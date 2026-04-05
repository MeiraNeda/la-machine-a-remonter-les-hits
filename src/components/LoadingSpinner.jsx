// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({
  message = "Chargement des tubes 80s...",
  size = "large", // "small" ou "large"
  color = "neon-pink" // "neon-pink", "neon-blue", "neon-green"
}) {
  const spinnerSizes = {
    small: "h-10 w-10 border-t-4",
    large: "h-16 w-16 border-t-4"
  };

  const colorClasses = {
    "neon-pink": "border-neon-pink",
    "neon-blue": "border-neon-blue",
    "neon-green": "border-neon-green"
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div 
        className={`
          animate-spin rounded-full 
          ${spinnerSizes[size] || spinnerSizes.large} 
          ${colorClasses[color] || colorClasses["neon-pink"]} 
          border-solid mb-6
        `}
      />
      
      {message && (
        <p className="text-xl md:text-2xl font-bold text-gray-300 animate-pulse-slow">
          {message}
        </p>
      )}
    </div>
  );
}