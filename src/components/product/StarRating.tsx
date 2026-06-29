import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, i) => {
        const filled = i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
