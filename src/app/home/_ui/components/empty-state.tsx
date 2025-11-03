import { useSession } from "@/hooks/use-session";

interface Props {
  onSelectPrompt?: (prompt: string) => void;
}

const EmptyState = ({ onSelectPrompt }: Props) => {
  const { user } = useSession();

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  return (
    <div className="relative flex flex-col items-center justify-end w-full h-full">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="relative w-full flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* GIF version */}
            <img src="/icon.gif" className="w-32" alt="AI Assistant Icon" />

            {/* Orange glow effect underneath */}
            <div className="absolute bottom-4 bg-orange-500 w-10 h-[2px] blur-sm rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl font-medium mt-4">
            Hello {capitalizeFirstLetter(user?.name || "there")}!
          </h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            I'm your academic mentor and career counselor. Ask me about placements, higher studies, competitive exams, or any academic topic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
