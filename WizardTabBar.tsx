import React, {createContext, useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {paper, row} from './JournalUI';

const WizardControlsContext = createContext<React.ReactNode>(null);
const SetWizardControlsContext = createContext<React.Dispatch<React.SetStateAction<React.ReactNode>> | null>(null);

export function WizardControlsProvider({children}: React.PropsWithChildren) {
  const [controls, setControls] = useState<React.ReactNode>(null);
  return (
    <SetWizardControlsContext.Provider value={setControls}>
      <WizardControlsContext.Provider value={controls}>
        {children}
      </WizardControlsContext.Provider>
    </SetWizardControlsContext.Provider>
  );
}

export function useSetWizardControls() {
  const setControls = useContext(SetWizardControlsContext);
  if (!setControls) throw new Error('WizardControlsProvider manquant');
  return setControls;
}

export function WizardTabBar(props: BottomTabBarProps) {
  const controls = useContext(WizardControlsContext);
  if (!controls) return <BottomTabBar {...props}/>;

  const {bottom, left, right} = props.insets;
  return (
    <View style={[styles.footer, {paddingBottom: bottom + 8, paddingLeft: left + 12, paddingRight: right + 12}]}>
      <View style={styles.controls}>{controls}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C8D6E5',
    paddingTop: 8,
  },
  controls: {
    ...row,
    width: '100%',
    maxWidth: 696,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
