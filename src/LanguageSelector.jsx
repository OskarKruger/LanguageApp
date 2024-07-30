import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

const LanguageSelector = () => {
  const [languages, setLanguages] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to 'en'
  const [selectedLanguageName, setSelectedLanguageName] = useState('');
  const [prompts, setPrompts] = useState({});
  const [dropdowns, setDropdowns] = useState([{ id: '1', droppableId: 'dropdown-1', draggableId: '1', selectedLanguage: 'en' }]); // State to manage multiple dropdowns

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [languagesResponse, translationsResponse] = await Promise.all([
          fetch(`https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/allLanguages/${selectedLanguage}`),
          fetch(`https://funwithapis-4kbqnvs2ha-uc.a.run.app/v1/translations/${selectedLanguage}`)
        ]);

        const languagesData = await languagesResponse.json();
        const translationsData = await translationsResponse.json();

        setLanguages(languagesData);

        const selectedLanguageName = Object.values(languagesData).find(lang =>
          lang.languageIsoCodesWithLocales[selectedLanguage]
        )?.languageIsoCodesWithLocales[selectedLanguage] || 'English';
        setSelectedLanguageName(selectedLanguageName);

        setPrompts(translationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedLanguage]);

  useEffect(() => {
    // Update selectedLanguage based on the language selected in the top card (lowest ID)
    if (dropdowns.length > 0) {
      const topCardLanguage = dropdowns[0].selectedLanguage || 'en'; // Default to 'en' if none selected
      setSelectedLanguage(topCardLanguage);
    }
  }, [dropdowns]);

  const handleChange = (event, dropdownId) => {
    const updatedDropdowns = dropdowns.map(dropdown => {
      if (dropdown.id === dropdownId) {
        return {
          ...dropdown,
          selectedLanguage: event.target.value
        };
      }
      return dropdown;
    });
    setDropdowns(updatedDropdowns);
  };

  const handleAddDropdown = () => {
    const newDropdownId = dropdowns.length > 0 ? String(Number(dropdowns[dropdowns.length - 1].id) + 1) : '0';
    const newDroppableId = `dropdown-${newDropdownId}`;
    setDropdowns([...dropdowns, { id: newDropdownId, droppableId: newDroppableId, draggableId: newDropdownId }]);
  };

  const handleDeleteDropdown = (dropdownId) => {
    const updatedDropdowns = dropdowns.filter(dropdown => dropdown.id !== dropdownId);
    setDropdowns(updatedDropdowns);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return; // Already at the top
    const updatedDropdowns = [...dropdowns];
    const temp = updatedDropdowns[index];
    updatedDropdowns[index] = updatedDropdowns[index - 1];
    updatedDropdowns[index - 1] = temp;
    setDropdowns(updatedDropdowns);
  };

  const handleMoveDown = (index) => {
    if (index === dropdowns.length - 1) return; // Already at the bottom
    const updatedDropdowns = [...dropdowns];
    const temp = updatedDropdowns[index];
    updatedDropdowns[index] = updatedDropdowns[index + 1];
    updatedDropdowns[index + 1] = temp;
    setDropdowns(updatedDropdowns);
  };

  // Get a set of selected languages
  const selectedLanguages = new Set(dropdowns.map(dropdown => dropdown.selectedLanguage));

  return (
    <div className="container">
      <h4>{prompts.SortLanguagesPrompt}</h4>
      {dropdowns.map((dropdown, index) => (
        <Card key={dropdown.droppableId} style={{ marginBottom: '8px' }}>
          <CardContent>
            <Select value={dropdown.selectedLanguage || 'en'} onChange={(e) => handleChange(e, dropdown.id)}>
              {Object.entries(languages).map(([isoCode, language]) => (
                <MenuItem key={isoCode} value={isoCode} disabled={selectedLanguages.has(isoCode) && dropdown.selectedLanguage !== isoCode}>
                  {language.languageIsoCodesWithLocales[isoCode]}
                </MenuItem>
              ))}
            </Select>
          </CardContent>
          <CardActions className="card-actions">
            <IconButton aria-label="move-up" onClick={() => handleMoveUp(index)} disabled={index === 0}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton aria-label="move-down" onClick={() => handleMoveDown(index)} disabled={index === dropdowns.length - 1}>
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => handleDeleteDropdown(dropdown.id)}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
      <div style={{ marginTop: '10px' }}>
        <Button variant="contained" color="primary" onClick={handleAddDropdown}>
          {prompts.ChoosePreferredLanguagesPrompt}
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelector;
