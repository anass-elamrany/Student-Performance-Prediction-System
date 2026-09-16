import { useEffect } from "react";

const setMetaDescription = (description) => {
  let meta = document.querySelector('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", description);
};

const PageTitle = ({ title, description }) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMetaDescription(description);
    }
  }, [title, description]);

  return null;
};

export default PageTitle;
