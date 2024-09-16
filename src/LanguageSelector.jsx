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
import Box from "@mui/material/Box"; // Add this import
import SearchIcon from "@mui/icons-material/Search"; // Add this import


// Base URL for API calls
const API_BASE_URL = "https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1";

const LanguageSelector = () => {
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

  const handleAddDropdown = () => setOpenModal(true);

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

  const handleDeleteDropdown = (dropdownId) => {
    setDropdownCards((prevCards) =>
      prevCards.filter((card) => card.id !== dropdownId)
    );
  };

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

  const isMoveDisabled = (index, direction) => {
    const newIndex = index + direction;
    return (
      newIndex < 0 ||
      newIndex >= dropdownCards.length ||
      dropdownCards[index].selectedLanguage === "" ||
      dropdownCards[newIndex].selectedLanguage === ""
    );
  };

  const isDeleteDisabled = () => {
    return (
      dropdownCards.length === 1 ||
      (dropdownCards.length === 2 &&
        dropdownCards.some((card) => card.selectedLanguage === ""))
    );
  };

  const getBaseLanguages = () => {
    return new Set(
      dropdownCards.map((card) => card.selectedLanguage.split("-")[0])
    );
  };

  const renderLanguageOptions = (selectedLanguage) => {
    const baseLanguages = getBaseLanguages();
    const baseLanguageCode = selectedLanguage.split("-")[0];

    return Object.entries(
      languages[baseLanguageCode]?.languageIsoCodesWithLocales || {}
    ).map(([variantCode, variantName]) => (
      <MenuItem
        key={variantCode}
        value={variantCode}
        disabled={
          !baseLanguages.has(variantCode.split("-")[0]) &&
          variantCode !== selectedLanguage
        }
      >
        {variantName} ({variantCode})
      </MenuItem>
    ));
  };

  const renderBaseLanguages = () => {
    const selectedLanguages = getBaseLanguages();
    return Object.entries(languages).map(([baseCode, baseLanguage]) => (
      <MenuItem
        key={baseCode}
        value={baseCode}
        disabled={selectedLanguages.has(baseCode)}
      >
        {baseLanguage.languageIsoCodesWithLocales[baseCode]} ({baseCode})
      </MenuItem>
    ));
  };

  return (
    <div className="container">
      <h4>{prompts.SortLanguagesPrompt || "Loading prompt..."}</h4>
      {dropdownCards.map((card, index) => (
        <Card key={card.droppableId} style={{ marginBottom: "8px" }}>
          <CardContent>
            <Select
              value={card.selectedLanguage || ""}
              onChange={(e) => handleChange(e, card.id)}
            >
              {renderLanguageOptions(card.selectedLanguage)}
            </Select>
          </CardContent>
          <CardActions className="card-actions">
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
      <div style={{ marginTop: "10px" }}>
        <Button variant="contained" onClick={handleAddDropdown}>
          {prompts.ChoosePreferredLanguagesPrompt || "Add Dropdown"}
        </Button>
      </div>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Select Language for New Card</DialogTitle>
        <Box sx={{ display: 'flex', alignContent: 'center', alignItems: 'center', marginLeft: 2, marginTop: 2  }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            sx={{ marginRight: 2, marginTop: 2 }}
          />
          <IconButton edge="end" color="inherit" sx={{ marginRight: 4 }}>
            <SearchIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <Select
            value={newCardLanguage}
            onChange={(e) => setNewCardLanguage(e.target.value)}
            fullWidth
          >
            <MenuItem value="" disabled>
              Select a base language
            </MenuItem>
            {renderBaseLanguages()}
          </Select>
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
