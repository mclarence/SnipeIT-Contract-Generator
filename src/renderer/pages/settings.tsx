import SaveIcon from '@mui/icons-material/Save';
import { Button, Card, SpeedDial, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AppStateSlice from 'renderer/slices/AppStateSlice';
import { RootState, useAppDispatch } from '../index';

interface SettingsProps {
  setAppBarTitle: React.Dispatch<React.SetStateAction<string>>;
}

export default function Settings(props: SettingsProps) {
  const appState = useSelector((state: RootState) => state.appState);
  const [editedSnipeItUrl, setEditedSnipeItUrl] = useState(appState.snipeItUrl);
  const [editedSnipeItAccessToken, setEditedSnipeItAccessToken] = useState(
    appState.snipeItAccessToken
  );
  const [editedTemplateLocation, setEditedTemplateLocation] = useState(
    appState.templateLocation
  );
  const [editedTemplateDefinition, setEditedTemplateDefinition] = useState(
    appState.templateDefinition
  );
  const [editedSslVerification, setEditedSslVerification] = useState(
    appState.sslVerification
  );
  const [showSaveButton, setShowSaveButton] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    props.setAppBarTitle('Settings');

    window.electron.ipcRenderer.on('open-file', (event: any, arg: any) => {
      if (!event.canceled) {
        if (event.caller === 'template-definition') {
          setEditedTemplateDefinition(event.filePaths[0]);
        } else if (event.caller === 'template-location') {
          setEditedTemplateLocation(event.filePaths[0]);
        }
        
      }
    });
  }, []);

  useEffect(() => {
    setShowSaveButton(
      editedSnipeItUrl !== appState.snipeItUrl ||
        editedSnipeItAccessToken !== appState.snipeItAccessToken ||
        editedTemplateLocation !== appState.templateLocation ||
        editedSslVerification !== appState.sslVerification ||
        editedTemplateDefinition !== appState.templateDefinition
    );
  }, [
    editedSnipeItUrl,
    editedSnipeItAccessToken,
    editedTemplateLocation,
    editedSslVerification,
    editedTemplateDefinition,
  ]);

  const onSave = () => {
    localStorage.setItem('snipeit-url', editedSnipeItUrl);
    localStorage.setItem('snipeit-access-token', editedSnipeItAccessToken);
    localStorage.setItem('template-location', editedTemplateLocation);
    localStorage.setItem('ssl-verification', editedSslVerification.toString());
    localStorage.setItem('template-definition', editedTemplateDefinition);
    dispatch(AppStateSlice.actions.setSnipeItUrl(editedSnipeItUrl));
    dispatch(
      AppStateSlice.actions.setSnipeItAccessToken(editedSnipeItAccessToken)
    );
    dispatch(AppStateSlice.actions.setTemplateLocation(editedTemplateLocation));
    dispatch(AppStateSlice.actions.setSslVerification(editedSslVerification));
    dispatch(AppStateSlice.actions.setTemplateDefinition(editedTemplateDefinition));
    setShowSaveButton(false);

    dispatch(
      AppStateSlice.actions.setSnackBar({
        open: true,
        message: 'Settings saved',
        severity: 'success',
      })
    );
  };

  return (
    <div>
        <Card sx={{ padding: 2 }}>
          <Stack gap={2}>
            <Stack direction="row" gap={2}>
              <TextField
                required
                id="outlined-required"
                label="SnipeIT Instance URL"
                helperText="Do not include /api/v1"
                value={editedSnipeItUrl}
                onChange={(event) => {
                  setEditedSnipeItUrl(event.target.value);
                }}
                fullWidth
              />
              {/* <FormControlLabel control={<Checkbox checked={editedSslVerification} onChange={(event) => {setEditedSslVerification(event.target.checked)}} />} label="SSL Verification" /> */}
            </Stack>

            <TextField
              required
              id="outlined-required"
              label="SnipeIT Access Token"
              helperText="Must have read access to all assets. Generate this in SnipeIT under Settings > API"
              value={editedSnipeItAccessToken}
              onChange={(event) => {
                setEditedSnipeItAccessToken(event.target.value);
              }}
            />
            <Stack direction="row" gap={2}>
              <TextField
                required
                id="outlined-required"
                label="Template Location"
                helperText="Must be a .docx file. This template is used to generate the contract document."
                value={editedTemplateLocation}
                onChange={(event) => {
                  setEditedTemplateLocation(event.target.value);
                }}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('open-file', {
                    title: 'Select Template Location',
                    filters: [
                      {
                        name: 'Microsoft Document',
                        extensions: ['docx'],
                      },
                    ],
                    caller: 'template-location',
                  });
                }}
              >
                Browse
              </Button>
            </Stack>
            <Stack direction="row" gap={2}>
              <TextField
                required
                id="outlined-required"
                label="Template Definition"
                helperText="A JavaScript (.js) file containing the template definition."
                value={editedTemplateDefinition}
                onChange={(event) => {
                  setEditedTemplateDefinition(event.target.value);
                }}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('open-file', {
                    title: 'Select Template Definition JS File',
                    filters: [
                      {
                        name: 'JavaScript File',
                        extensions: ['js'],
                      },
                    ],
                    caller: 'template-definition',
                  });
                }}
              >
                Browse
              </Button>
            </Stack>
          </Stack>
        </Card>
      <SpeedDial
        ariaLabel="Save"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SaveIcon />}
        hidden={!showSaveButton}
        onClick={onSave}
      />
    </div>
  );
}
