import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import SpeedDial from '@mui/material/SpeedDial';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SnipeITAsset } from 'main/interfaces/SnipeITAsset';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AppStateSlice from 'renderer/slices/AppStateSlice';
import { RootState, useAppDispatch } from '../index';

interface SingleGenerateProps {
  setAppBarTitle: React.Dispatch<React.SetStateAction<string>>;
}

export default function SingleGenerate(props: SingleGenerateProps) {
  const appState = useSelector((state: RootState) => state.appState);
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string>('');
  const [confirmedUser, setConfirmedUser] = useState<any>(null);
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [usernameFieldHelperText, setUsernameFieldHelperText] =
    useState<string>('');
  const [userAssets, setUserAssets] = useState<
    {
      id: number;
      asset_tag: string;
      asset_model: string;
      asset_serial: string;
    }[]
  >([
    {
      id: 1,
      asset_tag: 'Loading...',
      asset_model: 'Loading...',
      asset_serial: 'Loading...',
    },
  ]);
  const [selectedAssets, setSelectedAssets] = useState<any>({});
  const [stepOneComplete, setStepOneComplete] = useState<boolean>(false);
  const [stepTwoComplete, setStepTwoComplete] = useState<boolean>(false);
  const [stepThreeComplete, setStepThreeComplete] = useState<boolean>(false);
  const [saveFileLocation, setSaveFileLocation] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isFetchingUserAssets, setIsFetchingUserAssets] =
    useState<boolean>(false);

  const userAssetTableColumns: GridColDef[] = [
    { field: 'asset_tag', headerName: 'Asset Tag', flex: 1, maxWidth: 150 },
    { field: 'asset_model', headerName: 'Model', flex: 1, maxWidth: 200 },
    { field: 'asset_serial', headerName: 'Serial', flex: 1, maxWidth: 200 },
  ];

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${appState.snipeItAccessToken}`,
  };

  useEffect(() => {
    props.setAppBarTitle('Generate Single Contract');
    window.electron.ipcRenderer.on('save-file', (event: any, arg: any) => {
      if (!event.canceled) {
        setSaveFileLocation(event.filePath);
      }
    });

    window.electron.ipcRenderer.on('finished-generating-pdf', () => {
      setIsGeneratingPDF(false);
      dispatch(
        AppStateSlice.actions.setSnackBar({
          open: true,
          severity: 'success',
          message: 'PDF generated successfully',
        })
      );
      dispatch(AppStateSlice.actions.setIsProcessing(false));
    });

    window.electron.ipcRenderer.on('error-generating-pdf', (event: any, args: any) => {
      setIsGeneratingPDF(false);
      dispatch(
        AppStateSlice.actions.setSnackBar({
          open: true,
          severity: 'error',
          message: 'Error generating PDF: ' + event.message,
        })
      );

      dispatch(AppStateSlice.actions.setIsProcessing(false));
    });
  }, []);

  const resetState = () => {
    setUsername('');
    setUsernameError(false);
    setUsernameFieldHelperText('');
    setConfirmedUser(null);
    setStepOneComplete(false);
    setStepTwoComplete(false);
    setStepThreeComplete(false);
    setSaveFileLocation('');
    setIsGeneratingPDF(false);
    setSelectedAssets({});
    setUserAssets([]);
    dispatch(
      AppStateSlice.actions.setSnackBar({
        open: false,
        severity: 'success',
        message: '',
      })
    );
  };

  const handleUsernameSubmit = () => {
    setIsFetchingUserAssets(true);
    fetch(
      `${appState.snipeItUrl}/api/v1/users?${new URLSearchParams({
        username,
      })}`,
      {
        method: 'GET',
        headers,
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        setUsernameError(true);
        setUsernameFieldHelperText('Connection error');
        throw new Error('Connection error');
      })
      .then((data) => {
        console.log(data);
        if (data.total != 1) {
          setUsernameError(true);
          setUsernameFieldHelperText('Username not found');
          throw new Error('Username not found');
        } else {
          return data.rows[0];
        }
      })
      .then(async (user) => {
        await fetch(`${appState.snipeItUrl}/api/v1/users/${user.id}/assets`, {
          method: 'GET',
          headers,
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            setUsernameFieldHelperText('Failed to get user assets');
            setUsernameError(true);
            throw new Error('Failed to get user assets');
          })
          .then((data) => {
            // do something
            console.log(data);

            setUserAssets(
              data.rows.map((asset: SnipeITAsset) => {
                return {
                  id: asset.id,
                  asset_tag: asset.asset_tag,
                  asset_model: asset.model.name,
                  asset_serial: asset.serial,
                };
              })
            );
            setConfirmedUser(user);
            setStepOneComplete(true);
          });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsFetchingUserAssets(false);
      });
  };

  return (
    <div>
      <Accordion
        expanded={!stepOneComplete && appState.connectionStatus == 'connected'}
        disabled={
          stepOneComplete ||
          appState.connectionStatus == 'disconnected' ||
          appState.connectionStatus == 'failed' ||
          appState.connectionStatus == 'connecting'
        }
      >
        <AccordionSummary
          expandIcon={stepOneComplete ? <CheckIcon /> : undefined}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            1. Specify Username
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {confirmedUser
              ? `${confirmedUser.name} (${confirmedUser.username})`
              : 'None Selected'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={2}>
            <TextField
              error={usernameError}
              helperText={usernameFieldHelperText || ''}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError(false);
                setUsernameFieldHelperText('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && username.length > 0) {
                  handleUsernameSubmit();
                }
              }}
              required
              id="outlined-required"
              label="Username"
              value={username}
              sx={{ width: '90%' }}
              disabled={isFetchingUserAssets}
            />
            <Button
              variant="contained"
              onClick={handleUsernameSubmit}
              disabled={username.length < 1 || isFetchingUserAssets}
              sx={{ width: '10%' }}
            >
              {isFetchingUserAssets ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              ) : (
                'Submit'
              )}
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion
        disabled={!stepOneComplete || stepTwoComplete}
        expanded={stepOneComplete && !stepTwoComplete}
      >
        <AccordionSummary
          expandIcon={stepTwoComplete ? <CheckIcon /> : undefined}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            2. Select Assets
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {selectedAssets.length > 0
              ? `Selected ${selectedAssets.length} asset(s)`
              : 'None Selected'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <DataGrid
              rows={userAssets}
              columns={userAssetTableColumns}
              checkboxSelection
              onRowSelectionModelChange={(selectionModel) => {
                setSelectedAssets(selectionModel);
              }}
              autoHeight
              pageSizeOptions={[5, 10, 20, 50, 100]}
              slots={{
                noRowsOverlay: () => {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography>No assets found for this user.</Typography>
                    </div>
                  );
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setStepTwoComplete(true);
              }}
              disabled={!(selectedAssets.length > 0)}
            >
              Save
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion
        disabled={!stepTwoComplete || stepThreeComplete}
        expanded={stepTwoComplete && !stepThreeComplete}
      >
        <AccordionSummary
          expandIcon={stepThreeComplete ? <CheckIcon /> : undefined}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            3. Generate Contract
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                required
                id="outlined-required"
                label="Output File Name & Location"
                sx={{ width: '100%' }}
                value={saveFileLocation}
                onChange={(event) => {
                  setSaveFileLocation(event.target.value);
                }}
              />
              <Button
                variant="contained"
                disabled={isGeneratingPDF}
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('save-file', {
                    title: 'Save Contract',
                    filters: [{ name: 'PDF', extensions: ['pdf'] }],
                  });
                }}
              >
                Browse
              </Button>
            </Stack>
            <Tooltip title={appState.templateLocation === '' ? 'Contract template is missing. Please select one in settings.' : undefined} arrow>
              <span style={{ width: '100%' }}>
                <Button
                  fullWidth
                  disabled={
                    saveFileLocation === '' || appState.templateLocation === '' || isGeneratingPDF
                  }
                  variant="contained"
                  onClick={() => {
                    window.electron.ipcRenderer.sendMessage('generate-pdf', {
                      user: confirmedUser,
                      assets: userAssets.filter((asset: any) => {
                        return selectedAssets.includes(asset.id);
                      }),
                      filePath: saveFileLocation,
                      templatePath: appState.templateLocation,
                      templateDefinition: appState.templateDefinition,
                    });
                    setIsGeneratingPDF(true);
                    dispatch(AppStateSlice.actions.setIsProcessing(true));
                  }}
                >
                  {isGeneratingPDF ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    'Generate'
                  )}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </AccordionDetails>
      </Accordion>
      {(stepOneComplete && !isGeneratingPDF) ? (
        <SpeedDial
          ariaLabel="Reset"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<RestartAltIcon />}
          onClick={() => {
            resetState();
          }}
        />
      ) : null}
    </div>
  );
}
