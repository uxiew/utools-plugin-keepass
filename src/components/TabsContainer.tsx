import { Tabs, Tab, Box } from '@mui/material';
import { useState } from "react";
import "./TabsContainer.scss"

export type TabValue = {
  label: string
  icon: JSX.Element
  Comp: JSX.Element
}

interface TabsContainerProps {
  tabs: TabValue[]
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      className="tabs-tabpanel"
      hidden={value !== index}
      id={`tabs-tabpanel-${index}`}
      {...other}
    >
      {value === index && (children)}
    </div>
  );
}

export default function TabsContainer(props: TabsContainerProps) {

  const [tabValue, setTabValue] = useState(0);
  const { tabs } = props

  const changeTabValue = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return <Box width="100%" height="100%" className="tabs-wrapper">
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={tabValue}
        onChange={changeTabValue}
      >
        {
          tabs.map(({ label, icon }, i) => <Tab sx={{ minHeight: "48px" }} key={i} icon={icon} iconPosition="start" label={label} />)
        }
      </Tabs>
    </Box>
    <Box height="calc(100% - 48px)" overflow="auto">
      {
        tabs.map(({ Comp }, i) =>
          <TabPanel key={i} value={tabValue} index={i}>
            {Comp}
          </TabPanel>
        )
      }
    </Box>
  </Box>
}
