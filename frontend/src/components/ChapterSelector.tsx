import React from "react";
import { Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chapter, Volume } from "@/lib/types";
import { getPublishedChapters, formatChapterText, truncateText, isCurrentChapter } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface ChapterSelectorProps {
  chapters: Chapter[];
  currentChapterId: number;
  onChapterSelect: (chapterId: number) => void;
  readChapterIds?: Set<number>;
  className?: string;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  currentChapterId,
  onChapterSelect,
  readChapterIds = new Set(),
  className,
}) => {
  const { t } = useTranslation();
  // Get only published chapters and sort by number (ascending)
  const publishedChapters = getPublishedChapters(chapters).sort((a, b) => a.number - b.number);
  
  // Find current chapter for display
  const currentChapter = publishedChapters.find(chapter => chapter.id === currentChapterId);

  return (
    <Select 
      value={currentChapterId.toString()} 
      onValueChange={(value) => onChapterSelect(parseInt(value))}
    >
      <SelectTrigger className={`bg-manga-card border-manga-border text-manga-text min-w-[200px] ${className || ''}`}>
        <SelectValue>
          {currentChapter ? formatChapterText(currentChapter, undefined, t) : t('reader.selectChapter')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-manga-card border-manga-border max-h-60">
        {publishedChapters.map((chapter) => {
          const isRead = readChapterIds.has(chapter.id);
          const isCurrent = isCurrentChapter(chapter, currentChapterId);
          const displayText = formatChapterText(chapter, undefined, t);
          const truncatedText = truncateText(displayText);
          
          return (
            <SelectItem
              key={chapter.id}
              value={chapter.id.toString()}
              className={`
                text-manga-text hover:bg-manga-card-hover
                ${isCurrent ? 'bg-manga-card-hover text-manga-primary font-semibold' : ''}
                flex justify-between items-center
              `}
            >
              <span className="flex-1 truncate" title={displayText}>
                {truncatedText}
              </span>
              {isRead && !isCurrent && (
                <Check className="w-4 h-4 ml-2 text-manga-primary flex-shrink-0" />
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default ChapterSelector;