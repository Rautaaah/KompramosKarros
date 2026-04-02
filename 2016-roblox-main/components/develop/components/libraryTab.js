import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import VerticalSelector from "../../verticalSelector";
import CatalogFilters from "../../catalogFilters";
import CatalogLegend from "../../catalogLegend";
import CatalogPageInput from "../../catalogPageInput";
import CatalogPageResults from "../../catalogPageResults";
import CatalogPageStore from "../../../stores/catalogPage";

const useStyles = createUseStyles({
  libraryContainer: {
    paddingTop: "6px",
  },
  divider: {
    borderRight: "1px solid #ccc",
  },
});

const libraryTypes = [
  { name: "Models", category: "all", subCategory: "Models" },
  { name: "Audio", category: "all", subCategory: "Audio" },
  { name: "Videos", category: "all", subCategory: "Videos" },
  { name: "Decals", category: "all", subCategory: "Decals" },
  { name: "Meshes", category: "all", subCategory: "Meshes" },
  { name: "Plugins", category: "all", subCategory: "Plugins" },
];

const LibraryTabInner = () => {
  const s = useStyles();
  const store = CatalogPageStore.useContainer();
  const [selectedType, setSelectedType] = useState(libraryTypes[0].name);

  const selectedTypeData = useMemo(() => {
    return libraryTypes.find(v => v.name === selectedType) || libraryTypes[0];
  }, [selectedType]);

  useEffect(() => {
    store.setCategory(selectedTypeData.category);
    store.setSubCategory(selectedTypeData.subCategory);
  }, [selectedTypeData.category, selectedTypeData.subCategory]);

  return (
    <div className={`row ${s.libraryContainer}`}>
      <div className={`col-12 col-md-3 col-lg-2 pe-2 ${s.divider}`}>
        <VerticalSelector
          selected={selectedType}
          options={libraryTypes.map(v => ({
            name: v.name,
            url: "",
            onClick: () => setSelectedType(v.name),
          }))}
        />
        <CatalogFilters />
        <CatalogLegend />
      </div>
      <div className="col-12 col-md-9 col-lg-10">
        <CatalogPageInput />
        <CatalogPageResults />
      </div>
    </div>
  );
};

const LibraryTab = () => {
  return (
    <CatalogPageStore.Provider>
      <LibraryTabInner />
    </CatalogPageStore.Provider>
  );
};

export default LibraryTab;
