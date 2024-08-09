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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

const LanguageSelector = () => {
  // State to manage available languages and prompts
  const [languages, setLanguages] = useState({});
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

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [newCardLanguage, setNewCardLanguage] = useState("");

  // Fetch languages and translations whenever the selected language changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch languages and translations overall
        const [languagesResponse, translationsResponse] = await Promise.all([
          fetch(
            `https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/allLanguages/en`
          ),
          fetch(
            `https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/translations/en`
          ),
        ]);

        //Set states
        const languagesData = await languagesResponse.json();
        const translationsData = await translationsResponse.json();

        setLanguages(languagesData);

        // Set translation prompts, some languages don't have this, default is "SortLanguagesPrompt"
        setPrompts(translationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
    setOpenModal(true);
  };

  // Confirm adding a new card with the selected language from the modal
  const handleConfirmAdd = () => {
    const newDropdownId = String(dropdownCounter);
    const newDroppableId = `dropdown-${newDropdownId}`;
    setDropdowns([
      ...dropdowns,
      {
        id: newDropdownId,
        droppableId: newDroppableId,
        draggableId: newDropdownId,
        selectedLanguage: newCardLanguage,
      },
    ]);
    setDropdownCounter(dropdownCounter + 1); // Increment counter
    setNewCardLanguage(""); // Reset language selection
    setOpenModal(false); // Close modal
  };

  // Delete a card item (dropdown) by its ID
  const handleDeleteDropdown = (dropdownId) => {
    if (dropdowns.length > 1) {
      // Ensure there's at least one left, if not, disable button
      const updatedDropdowns = dropdowns.filter(
        (dropdown) => dropdown.id !== dropdownId
      );
      setDropdowns(updatedDropdowns);
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
  const selectedLanguages = new Set(
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
                dropdown.selectedLanguage === isoCode
                  ? Object.entries(language.languageIsoCodesWithLocales).map(
                      ([variantCode, variantName]) => (
                        <MenuItem
                          key={variantCode}
                          value={variantCode}
                        >
                          {variantName} ({variantCode})
                        </MenuItem>
                      )
                    )
                  : null
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

      {/* Modal for selecting new language */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Select Language for New Card</DialogTitle>
        <DialogContent>
          <TextField
            select
            value={newCardLanguage}
            onChange={(e) => setNewCardLanguage(e.target.value)}
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="" disabled>Select a language</option>
            {Object.entries(languages).map(([isoCode, language]) => (
              <option key={isoCode} value={isoCode}>
                {language.languageIsoCodesWithLocales[isoCode]} ({isoCode})
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleConfirmAdd} disabled={!newCardLanguage}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LanguageSelector;
