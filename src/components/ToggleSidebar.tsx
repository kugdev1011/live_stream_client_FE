import { useSidebar } from './ui/sidebar';

const ToggleSidebar = ({ _isOpen }: { _isOpen: false }) => {
  const { setOpen } = useSidebar();
  setOpen(_isOpen);

  return null;
};

export default ToggleSidebar;
