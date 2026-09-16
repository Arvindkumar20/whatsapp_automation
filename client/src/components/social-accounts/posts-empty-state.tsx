import { Button } from "@/components/ui/button";
import { ImagePlus, Plus } from "lucide-react";

interface PostsEmptyStateProps {
  onCreatePost: () => void;
  hasActiveFilters?: boolean;
}

export function PostsEmptyState({ onCreatePost, hasActiveFilters }: PostsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <ImagePlus className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">
        {hasActiveFilters ? "No posts match your filters" : "No posts yet"}
      </h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        {hasActiveFilters
          ? "Try adjusting your search or status filter."
          : "Create your first Instagram post to get started with scheduling and publishing."}
      </p>
      {!hasActiveFilters && (
        <Button
          onClick={onCreatePost}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create First Post
        </Button>
      )}
    </div>
  );
}
