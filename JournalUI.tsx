import React,{useEffect,useState,useRef} from 'react';
import {AppState,Platform,ScrollView,View,Text,TextInput,Pressable,Switch,SafeAreaView} from 'react-native';
import type { LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Flame, Waves, CloudFog, BatteryLow, Zap, NotebookPen, Smile, ChevronLeft, ChevronRight } from 'lucide-react-native';

export const symptomIcons: Record<string, typeof Flame> = {
  Inflammation: Flame, Digestif: Waves, 'Brouillard mental': CloudFog,
  Fatigue: BatteryLow, Douleur: Zap, Autre: NotebookPen,
};
export const blue='#385C83', mist='#E3ECF6', ink='#233851', cream='#FAF7F2', paper='#FFFDFA', muted='#526780', green='#27664D';
export function Button({label,onPress,icon:Icon,well=false,active=false,selected,disabled=false}:{label:string;icon?:typeof Flame;well?:boolean;onPress:()=>void;active?:boolean;selected?:boolean;disabled?:boolean}){
 const highlighted = selected ?? active;
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected: selected ?? (Icon && !well ? active : undefined), disabled}} disabled={disabled} onPress={onPress} style={{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:highlighted?blue:well?'#E1EFE7':mist,opacity:disabled?0.55:1,paddingHorizontal:14,paddingVertical:11,borderRadius:14}}>{Icon && <Icon size={18} color={highlighted?'white':well?green:ink}/>}<Text style={{color:highlighted?'white':well?green:ink,fontWeight:'600'}}>{label}</Text></Pressable>
}
export function SymptomCarousel({children}: React.PropsWithChildren) {
  const list = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [content, setContent] = useState(0);
  const [offset, setOffset] = useState(0);
  const end = Math.max(0, content - width);

  function arrow(direction: -1 | 1) {
    const previous = direction === -1;
    const disabled = previous ? offset <= 1 : offset >= end - 1;
    const Icon = previous ? ChevronLeft : ChevronRight;
    const label = previous ? 'Symptômes précédents' : 'Symptômes suivants';
    const target = Math.max(0, Math.min(end, offset + direction * width * 0.85));
    return (
      <Pressable accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{disabled}} disabled={disabled}
        onPress={() => list.current?.scrollTo({
          x: target, animated: true,
        })}
        style={{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:mist,opacity:disabled?0.45:1}}>
        <Icon size={22} color={blue}/>
      </Pressable>
    );
  }

  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
      {arrow(-1)}
      <ScrollView ref={list} horizontal showsHorizontalScrollIndicator={false}
        style={{flex:1,minWidth:0}} contentContainerStyle={{gap:8,alignItems:'center',paddingVertical:4}}
        onLayout={(e: LayoutChangeEvent)=>setWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={(nextWidth: number) => setContent(nextWidth)} scrollEventThrottle={16}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>)=>setOffset(e.nativeEvent.contentOffset.x)}>
        {children}
      </ScrollView>
      {arrow(1)}
    </View>
  );
}
export const row={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:8},heading={fontSize:23,fontWeight:'700' as const,color:ink};

export function JournalPage({children}:React.PropsWithChildren){
 return <SafeAreaView style={{flex:1,backgroundColor:cream}}><ScrollView contentContainerStyle={{width:'100%',maxWidth:740,alignSelf:'center',padding:22,paddingTop:48,gap:18}}>
{children}</ScrollView></SafeAreaView>}

