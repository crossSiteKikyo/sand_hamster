export default function Tag({ tagName, type }) {
  const colorMap = {
    male: "bg-blue-300 dark:bg-blue-600",
    female: "bg-pink-300 dark:bg-pink-600",
    other: "bg-gray-300 dark:bg-gray-700",
  };
  let name = tagName;
  if (type == "male") {
    name = tagName.replace("male:", "");
  } else if (type == "female") {
    name = tagName.replace("female:", "");
  }
  return <a className={`px-1 rounded-md ${colorMap[type]}`}>{name}</a>;
}
