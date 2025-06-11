import React from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';

export const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <Paper elevation={1}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(event, newValue) => onTabChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              py: 2,
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {IconComponent && <IconComponent size={16} />}
                    <span>{tab.label}</span>
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>
    </Paper>
  );
};