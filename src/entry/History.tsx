import { Box, Button, Step, StepButton, StepContent, Stepper } from "@mui/material";
import React, { useState } from "react";
import { DateFormat } from "../utils/date_format";
import type { KdbxEntry } from "kdbxweb";

interface Props {
  histories: KdbxEntry[],
}

function EntryHistory({ histories }: Props) {

  const [activeStep, setActiveStep] = useState(0)

  const handleStep = (step) => () => {
    setActiveStep(step);
  };


  const show = () => { }

  return <Box sx={{ width: '100%' }}>
    <Stepper orientation="vertical" nonLinear activeStep={activeStep}>
      {histories.reverse().map((entry, index) => (
        <Step key={index}>
          <StepButton color="inherit" onClick={handleStep(index)}>
            {DateFormat.dtStr(entry.times.lastModTime!)}
          </StepButton>
          <StepContent sx={{ padding: "10px" }}>
            <Button
              variant="outlined"
              onClick={show}
              sx={{ mt: 1, mr: 1 }}
            >
              查看内容
            </Button>
            <Button
              variant="outlined"
              onClick={show}
              sx={{ mt: 1, mr: 1 }}
            >
              还原历史
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={show}
              sx={{ mt: 1, mr: 1 }}
            >
              删除历史
            </Button>
          </ StepContent>
        </Step>
      ))}
    </Stepper>
  </Box>
}


export default React.memo(EntryHistory)
