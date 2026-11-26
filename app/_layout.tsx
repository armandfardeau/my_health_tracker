import {Tabs} from 'expo-router';
import {CalendarDays, NotebookPen, Settings} from 'lucide-react-native';
import {JournalProvider} from '../JournalState';
import {blue,muted,paper} from '../JournalUI';

export default function Layout(){
  return (
    <JournalProvider>
      <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:blue,tabBarInactiveTintColor:muted,
        tabBarStyle:{backgroundColor:paper,borderTopColor:'#C8D6E5'},tabBarHideOnKeyboard:true}}>
        <Tabs.Screen name="index" options={{title:'Aujourd’hui',tabBarIcon:({color,size})=><NotebookPen color={color} size={size}/>}}/>
        <Tabs.Screen name="calendrier" options={{title:'Calendrier',tabBarIcon:({color,size})=><CalendarDays color={color} size={size}/>}}/>
        <Tabs.Screen name="reglages" options={{title:'Réglages',tabBarIcon:({color,size})=><Settings color={color} size={size}/>}}/>
      </Tabs>
    </JournalProvider>
  );
}
