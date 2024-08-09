import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

const LanguageSelector = () => {
  // State to manage available languages and prompts
  const [languages, setLanguages] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language, only for the initial item and not subsequent items
  const [selectedLanguageName, setSelectedLanguageName] = useState(""); //Leave empty due to new cards not have preselected language
  const [prompts, setPrompts] = useState({});

  // State to manage multiple language card items (dropdowns)
  const [dropdowns, setDropdowns] = useState([
    {
      id: "1",
      droppableId: "dropdown-1",
      draggableId: "1",
      selectedLanguage: "en",
    },
  ]);
  const [dropdownCounter, setDropdownCounter] = useState(2); // Counter for unique IDs to handle unsequenced card additions

  // Fetch languages and translations whenever the selected language changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch languages and translations overall
        const [languagesResponse, translationsResponse] = await Promise.all([
          fetch(
            `https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/allLanguages/${selectedLanguage}`
          ),
          fetch(
            `https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/translations/${selectedLanguage}`
          ),
        ]);

        //Set states
        const languagesData = await languagesResponse.json();
        const translationsData = await translationsResponse.json();

        setLanguages(languagesData);

        // Determine the name of the selected language from the isoCodes from backend
        const selectedLanguageName =
          Object.values(languagesData).find(
            (lang) => lang.languageIsoCodesWithLocales[selectedLanguage]
          )?.languageIsoCodesWithLocales[selectedLanguage] || "English";
        setSelectedLanguageName(selectedLanguageName);

        // Set translation prompts, some languages don't have this, default is "SortLanguagesPrompt"
        setPrompts(translationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLanguage]);

  // Update the selected language and promt, based on the top-most card item (dropdown)
  useEffect(() => {
    if (dropdowns.length > 0 && dropdowns[0].selectedLanguage) {
      const topCardLanguage = dropdowns[0].selectedLanguage || "en"; // Default to 'en' if nothing else
      setSelectedLanguage(topCardLanguage);
    }
  }, [dropdowns]);

  // Handle change in language selection for a card items (dropdowns)
  const handleChange = (event, dropdownId) => {
    const updatedDropdowns = dropdowns.map((dropdown) => {
      if (dropdown.id === dropdownId) {
        return {
          ...dropdown,
          selectedLanguage: event.target.value,
        };
      }
      return dropdown;
    });
    setDropdowns(updatedDropdowns);
  };

  // Add a new card item (dropdown) to the list
  const handleAddDropdown = () => {
    const newDropdownId = String(dropdownCounter);
    const newDroppableId = `dropdown-${newDropdownId}`;
    setDropdowns([
      ...dropdowns,
      {
        id: newDropdownId,
        droppableId: newDroppableId,
        draggableId: newDropdownId,
        selectedLanguage: "", //Make it empty to force a language selection
      },
    ]);
    setDropdownCounter(dropdownCounter + 1); // Increment counter
  };

  // Delete a card item (dropdown) by its ID
  const handleDeleteDropdown = (dropdownId) => {
    if (dropdowns.length > 1) {
      // Ensure there's at least one left, if not, disable button
      const updatedDropdowns = dropdowns.filter(
        (dropdown) => dropdown.id !== dropdownId
      );
      setDropdowns(updatedDropdowns);
      //Keep dropdownCounter to avoid reusing IDs
    }
  };

  // Move a card item (dropdown) up in the list
  const handleMoveUp = (index) => {
    if (index === 0) return; // Already at the top, disable button
    const updatedDropdowns = [...dropdowns];
    const temp = updatedDropdowns[index];
    updatedDropdowns[index] = updatedDropdowns[index - 1];
    updatedDropdowns[index - 1] = temp;
    setDropdowns(updatedDropdowns);
  };

  // Move a card item (dropdown) down in the list
  const handleMoveDown = (index) => {
    if (index === dropdowns.length - 1) return; // Already at the bottom, disable button
    const updatedDropdowns = [...dropdowns];
    const temp = updatedDropdowns[index];
    updatedDropdowns[index] = updatedDropdowns[index + 1];
    updatedDropdowns[index + 1] = temp;
    setDropdowns(updatedDropdowns);
  };

  // Extract unique selected languages to manage card item (dropdown) state
  const selectedLanguages = new Set( //Use "Set" to avoid duplicates
    dropdowns.map((dropdown) => dropdown.selectedLanguage)
  );

  return (
    <div className="container">
      {/* Display prompts with selected language translations*/}
      <h4>{prompts.SortLanguagesPrompt}</h4>

      {/* Map all cards to render each Card*/}
      {dropdowns.map((dropdown, index) => (
        <Card key={dropdown.droppableId} style={{ marginBottom: "8px" }}>
          <CardContent>
            {/* Dropdown menu for selecting a language */}
            <Select
              value={dropdown.selectedLanguage || ""}
              onChange={(e) => handleChange(e, dropdown.id)}
            >
              {/* Map through the available languages to create dropdown options */}
              {Object.entries(languages).map(([isoCode, language]) =>
                Object.entries(language.languageIsoCodesWithLocales).map(
                  ([variantCode, variantName]) => (
                    <MenuItem
                      key={variantCode}
                      value={variantCode}
                      // Disable language if already selected in another card
                      disabled={
                        selectedLanguages.has(variantCode) &&
                        dropdown.selectedLanguage !== variantCode
                      }
                    >
                      {variantName} ({variantCode})
                    </MenuItem>
                  )
                )
              )}
            </Select>
          </CardContent>
          <CardActions className="card-actions">
            {/* Button to move the cards up*/}
            <IconButton
              aria-label="move-up"
              onClick={() => handleMoveUp(index)}
              disabled={
                index === 0 || // Disable if it's already at the top
                dropdown.selectedLanguage === "" || // Disable if no language is selected
                dropdowns[index - 1]?.selectedLanguage === "" // Disable if the above dropdown is empty
              }
            >
              <ArrowUpwardIcon />
            </IconButton>
            {/* Button to move the cards down*/}
            <IconButton
              aria-label="move-down"
              onClick={() => handleMoveDown(index)}
              disabled={
                index === dropdowns.length - 1 || // Disable if it's already at the bottom
                dropdown.selectedLanguage === "" || // Disable if no language is selected
                dropdowns[index + 1]?.selectedLanguage === "" // Disable if the below dropdown is empty
              }
            >
              <ArrowDownwardIcon />
            </IconButton>
            {/* Button to delete the cards*/}
            <IconButton
              aria-label="delete"
              onClick={() => handleDeleteDropdown(dropdown.id)}
              disabled={
                dropdowns.length === 1 || // Disable if only one card is left
                (dropdowns.length === 2 &&
                  dropdowns.some(
                    (dropdown) => dropdown.selectedLanguage === ""
                  )) // Disable if there are two cards left and one is empty
              }
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}

      {/* Button to add a new dropdown*/}
      <div style={{ marginTop: "10px" }}>
        <Button variant="contained" color="primary" onClick={handleAddDropdown}>
          {prompts.ChoosePreferredLanguagesPrompt}
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelector;
