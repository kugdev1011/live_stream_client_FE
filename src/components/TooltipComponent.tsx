import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ComponentProps {
  text: string;
  children: JSX.Element;
}

const TooltipComponent = (props: ComponentProps) => {
  const { text, children } = props;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className="bg-secondary dark:bg-muted text-black dark:text-white max-w-full"
          align="start"
        >
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;
