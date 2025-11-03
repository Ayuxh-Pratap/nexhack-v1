import { useSession } from "@/hooks/use-session";

interface Props {
  onSelectPrompt?: (prompt: string) => void;
}

const EmptyState = ({ onSelectPrompt }: Props) => {
  const { user } = useSession();

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const samplePrompts = [
    {
      title: "Creative Writing",
      description: "Help me write a story or poem",
      prompt: "Can you help me write a creative story or poem? I'm looking for inspiration and guidance."
    },
    {
      title: "Code Assistant",
      description: "Debug code or explain concepts",
      prompt: "I need help with programming. Can you explain some concepts or help me debug my code?"
    },
    {
      title: "Research Helper",
      description: "Summarize topics or answer questions",
      prompt: "I'd like to research a topic. Can you help me find information and summarize key points?"
    },
    {
      title: "Brainstorming",
      description: "Generate ideas for projects",
      prompt: "I need help brainstorming ideas for a project. Can you help me generate creative solutions?"
    }
  ];

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
            Welcome to your AI assistant. Start a conversation by typing a message below.
          </p>
        </div>

        {/* Sample prompts - compact and premium */}
        <div className="grid w-full grid-cols-1 gap-1.5 mt-6 mb-4 md:grid-cols-2 max-w-xl">
          {samplePrompts.map((prompt) => (
            <div
              key={prompt.title}
              className="flex flex-col items-start w-full px-3 py-2.5 bg-transparent border cursor-pointer rounded-xl border-border/50 hover:bg-muted/50 hover:border-border select-none active:scale-98 transition-all duration-200 group"
              onClick={() => onSelectPrompt?.(prompt.prompt)}
            >
              <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                {prompt.title}
              </h3>
              <p className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors mt-0.5">
                {prompt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
