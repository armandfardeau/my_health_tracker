import {useIsFocused} from '@react-navigation/native';
import {useRouter} from 'expo-router';
import {Text} from 'react-native';
import {EntryForm} from '../EntryForm';
import {JournalPage, heading} from '../JournalUI';

export default function TodayWizard() {
  const router = useRouter();
  const focused = useIsFocused();

  function returnToToday() {
    router.navigate('/');
  }

  return (
    <JournalPage>
      <Text accessibilityRole="header" style={heading}>Noter un symptôme</Text>
      {focused && <EntryForm onExit={returnToToday} onSaved={returnToToday}/>}
    </JournalPage>
  );
}
