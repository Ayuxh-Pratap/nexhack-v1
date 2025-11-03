import { useState, useRef } from "react";
import { BsSpeedometer2 } from "react-icons/bs";
import { ChevronDown } from "lucide-react";

const menuItems = ["Beginner", "Intermediate", "Advanced"];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const Dropdown = ({ changeSkillLevel }: { changeSkillLevel: (level: number) => void }) => {
  const [current, setCurrent] = useState<string>("Beginner");
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (item: string, index: number) => {
    setCurrent(item);
    changeSkillLevel(index);
    setOpen(false);
  };

  // Close dropdown if clicked outside
  // (optional: for better UX)
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //       setOpen(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <BsSpeedometer2
          size={20}
          className={classNames(
            current === "Beginner" && "text-green-500",
            current === "Intermediate" && "text-yellow-500",
            current === "Advanced" && "text-red-500"
          )}
        />
        <ChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className={classNames(
                  current === item ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  "block w-full text-left px-4 py-2 text-sm"
                )}
                onClick={() => handleChange(item, index)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
