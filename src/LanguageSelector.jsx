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

// Base URL for API calls
const API_BASE_URL = "https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1";

const LanguageSelector = () => {
  // State to manage available languages, prompts, and dropdown cards
  const [languages, setLanguages] = useState({});
  const [prompts, setPrompts] = useState({});
  const [dropdownCards, setDropdownCards] = useState([
    {
      id: "1",
      droppableId: "dropdown-1",
      draggableId: "1",
      selectedLanguage: "en",
    },
  ]);
  const [dropdownCounter, setDropdownCounter] = useState(2);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [newCardLanguage, setNewCardLanguage] = useState("");

  // Fetch languages and translations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [languagesResponse, translationsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/allLanguages/en`),
          fetch(`${API_BASE_URL}/translations/en`),
        ]);

        const languagesData = await languagesResponse.json();
        const translationsData = await translationsResponse.json();

        setLanguages(languagesData);

        const topLanguageCode = dropdownCards[0].selectedLanguage;
        const baseLanguageCode = topLanguageCode.split("-")[0];

        const topLanguagePromptResponse = await fetch(
          `${API_BASE_URL}/translations/${baseLanguageCode}`
        );
        const topLanguagePromptData = await topLanguagePromptResponse.json();

        setPrompts({
          ...translationsData,
          SortLanguagesPrompt:
            topLanguagePromptData.SortLanguagesPrompt ||
            translationsData.SortLanguagesPrompt,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dropdownCards]);

  // Handler for language selection change
  const handleChange = (event, dropdownId) => {
    const selectedValue = event.target.value;
    setDropdownCards((prevCards) =>
      prevCards.map((card) =>
        card.id === dropdownId
          ? { ...card, selectedLanguage: selectedValue }
          : card
      )
    );
  };

  // Handler to open modal for adding a new dropdown card
  const handleAddDropdown = () => setOpenModal(true);

  // Handler to confirm adding a new dropdown card
  const handleConfirmAdd = () => {
    const newDropdownId = String(dropdownCounter);
    setDropdownCards((prevCards) => [
      ...prevCards,
      {
        id: newDropdownId,
        droppableId: `dropdown-${newDropdownId}`,
        draggableId: newDropdownId,
        selectedLanguage: newCardLanguage,
      },
    ]);
    setDropdownCounter((prevCounter) => prevCounter + 1);
    setNewCardLanguage("");
    setOpenModal(false);
  };

  // Handler to delete a dropdown card
  const handleDeleteDropdown = (dropdownId) => {
    setDropdownCards((prevCards) =>
      prevCards.filter((card) => card.id !== dropdownId)
    );
  };

  // Handler to move a dropdown card up or down in the list
  const handleMove = (index, direction) => {
    setDropdownCards((prevCards) => {
      const newCards = [...prevCards];
      const newIndex = index + direction;
      [newCards[index], newCards[newIndex]] = [
        newCards[newIndex],
        newCards[index],
      ];
      return newCards;
    });
  };

  // Function to check if a move button should be disabled
  const isMoveDisabled = (index, direction) => {
    const newIndex = index + direction;
    return (
      newIndex < 0 ||
      newIndex >= dropdownCards.length ||
      dropdownCards[index].selectedLanguage === "" ||
      dropdownCards[newIndex].selectedLanguage === ""
    );
  };

  // Function to check if delete button should be disabled
  const isDeleteDisabled = () => {
    return (
      dropdownCards.length === 1 ||
      (dropdownCards.length === 2 &&
        dropdownCards.some((card) => card.selectedLanguage === ""))
    );
  };

  // Function to render language options for a dropdown card
  const renderLanguageOptions = (selectedLanguage) => {
    return Object.entries(languages).flatMap(([isoCode, language]) =>
      selectedLanguage.startsWith(isoCode)
        ? Object.entries(language.languageIsoCodesWithLocales).map(
            ([variantCode, variantName]) => (
              <MenuItem key={variantCode} value={variantCode}>
                {variantName} ({variantCode})
              </MenuItem>
            )
          )
        : []
    );
  };

  return (
    <div className="container">
      {/* Display prompt for sorting languages */}
      <h4>{prompts.SortLanguagesPrompt || "Loading prompt..."}</h4>

      {/* Render all dropdown cards */}
      {dropdownCards.map((card, index) => (
        <Card key={card.droppableId} style={{ marginBottom: "8px" }}>
          <CardContent>
            {/* Dropdown for language selection */}
            <Select
              value={card.selectedLanguage || ""}
              onChange={(e) => handleChange(e, card.id)}
            >
              {renderLanguageOptions(card.selectedLanguage)}
            </Select>
          </CardContent>
          <CardActions className="card-actions">
            {/* Buttons for moving up, moving down, and deleting */}
            <IconButton
              aria-label="move-up"
              onClick={() => handleMove(index, -1)}
              disabled={isMoveDisabled(index, -1)}
            >
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton
              aria-label="move-down"
              onClick={() => handleMove(index, 1)}
              disabled={isMoveDisabled(index, 1)}
            >
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDeleteDropdown(card.id)}
              disabled={isDeleteDisabled()}
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}

      {/* Button to add a new dropdown card */}
      <div style={{ marginTop: "10px" }}>
        <Button variant="contained" color="primary" onClick={handleAddDropdown}>
          {prompts.ChoosePreferredLanguagesPrompt || "Add Dropdown"}
        </Button>
      </div>

      {/* Modal for selecting a new language */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Select Language for New Card</DialogTitle>
        <DialogContent>
          <TextField
            select
            value={newCardLanguage}
            onChange={(e) => setNewCardLanguage(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="" disabled>
              Select a language
            </option>
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
