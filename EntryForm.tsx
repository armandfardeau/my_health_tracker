import React, {useCallback, useRef, useState} from 'react';
import {useFocusEffect} from 'expo-router';
import {useSetWizardControls} from './WizardTabBar';
import {Text, View, TextInput, StyleSheet} from 'react-native';
import {Smile} from 'lucide-react-native';
import {Button, blue, heading, ink, muted, paper, row} from './JournalUI';
import {useJournal} from './JournalState';
import {activity, categories, detailsByCategory, fatigue, fatigueContext, painLevels, signs} from './symptoms';
import type {SymptomAnswers, SymptomCategory} from './symptoms';

const steps = [
  'Catégorie', 'Détails', 'Intensité de la douleur', 'Autres signes',
  'Fatigue', 'Contexte de la fatigue', 'Activité physique', 'Alimentation',
];
const lastStep = steps.length - 1;
type MultiField = 'details' | 'signs' | 'fatigue' | 'fatigueContext';

export function EntryForm({date, onSaved, onStart, onExit}: {
  date?: Date;
  onSaved?: () => void;
  onStart?: () => void;
  onExit?: () => void;
}) {
  const {record} = useJournal();
  const setWizardControls = useSetWizardControls();
  const [step, setStep] = useState<number | null>(onExit ? 0 : null);
  const [category, setCategory] = useState<SymptomCategory>();
  const [answers, setAnswers] = useState<SymptomAnswers>({});
  const [note, setNote] = useState('');
  const [hour, setHour] = useState(() => new Date().toTimeString().slice(0, 5));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  function reset() {
    setStep(null);
    setCategory(undefined);
    setAnswers({});
    setNote('');
    setError('');
  }

  function chooseCategory(value?: SymptomCategory) {
    if (value === category) return;
    setCategory(value);
    setAnswers(current => ({...current, details: undefined, otherDetail: undefined}));
  }

  function goTo(next: number) {
    setStep(next);
    setError('');
  }

  function updateAnswer<K extends keyof SymptomAnswers>(key: K, value: SymptomAnswers[K]) {
    setAnswers(current => ({...current, [key]: value}));
  }

  function toggleChoice(field: MultiField, value: string) {
    setAnswers(current => {
      const selected = current[field] ?? [];
      let next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
      if (field === 'fatigue' && next.includes('Non')) {
        next = value === 'Non' ? ['Non'] : next.filter(item => item !== 'Non');
      }
      return {
        ...current,
        [field]: next.length ? next : undefined,
        ...(field === 'details' && !next.includes('Autres') && {otherDetail: undefined}),
      };
    });
  }

  async function submit(well: boolean, draft = answers) {
    if (submitting.current) return;
    const text = note.trim();
    const clean: SymptomAnswers = {
      ...draft,
      otherDetail: draft.otherDetail?.trim() || undefined,
      diet: draft.diet?.trim() || undefined,
    };
    const hasAnswers = Object.values(clean).some(value => value !== undefined);
    if (!well && !category && !text && !hasAnswers) {
      setError('Ajoutez au moins une réponse ou une note pour enregistrer.');
      return;
    }

    const when = date ? new Date(date) : new Date();
    if (date) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hour)) {
        setError('Indiquez une heure entre 00:00 et 23:59.');
        return;
      }
      const [hours, minutes] = hour.split(':').map(Number);
      when.setHours(hours, minutes, 0, 0);
      if (when.getHours() !== hours || when.getMinutes() !== minutes) {
        setError('Cette heure n’existe pas à cette date.');
        return;
      }
    }
    if (when.getTime() > Date.now()) {
      setError('Indiquez une date et une heure passées.');
      return;
    }

    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const saved = await record(well ? null : category ?? 'Autre', well ? '' : text, when, well ? undefined : clean);
      if (!saved) {
        setError('Entrée non enregistrée. Réessayez.');
        return;
      }
      reset();
      onSaved?.();
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  function skip() {
    switch (step) {
      case 0: chooseCategory(); break;
      case 1:
        setAnswers(current => ({...current, details: undefined, otherDetail: undefined}));
        break;
      case 2: updateAnswer('pain', undefined); break;
      case 3: updateAnswer('signs', undefined); break;
      case 4: updateAnswer('fatigue', undefined); break;
      case 5: updateAnswer('fatigueContext', undefined); break;
      case 6: updateAnswer('activity', undefined); break;
      case lastStep:
        updateAnswer('diet', undefined);
        void submit(false, {...answers, diet: undefined});
        return;
    }
    if (step !== null) goTo(step + 1);
  }

  function choices(field: MultiField, options: readonly string[]) {
    return <View style={row}>{options.map(value =>
      <Button key={value} label={value} selected={answers[field]?.includes(value) ?? false}
        onPress={() => toggleChoice(field, value)}/>
    )}</View>;
  }

  function stepContent() {
    switch (step) {
      case 0:
        return <View style={row}>{categories.map(({value, label}) =>
          <Button key={value} label={label} selected={category === value} onPress={() => chooseCategory(value)}/>
        )}</View>;
      case 1:
        return category ? <>
          {choices('details', detailsByCategory[category])}
          {answers.details?.includes('Autres') && <TextInput
            accessibilityLabel="Préciser les autres détails" placeholder="Préciser (facultatif)"
            placeholderTextColor={muted} selectionColor={blue} style={styles.input}
            value={answers.otherDetail ?? ''} onChangeText={value => updateAnswer('otherDetail', value)}
          />}
        </> : <Text style={styles.text}>Revenez choisir une catégorie ou passez cette étape.</Text>;
      case 2:
        return <View style={styles.stack}>{painLevels.map((description, index) =>
          <Button key={description} label={(index + 1) + ' · ' + description}
            selected={answers.pain === index + 1} onPress={() => updateAnswer('pain', index + 1)}/>
        )}</View>;
      case 3: return choices('signs', signs);
      case 4: return choices('fatigue', fatigue);
      case 5: return choices('fatigueContext', fatigueContext);
      case 6:
        return <View style={row}>{activity.map(value =>
          <Button key={value} label={value} selected={answers.activity === value}
            onPress={() => updateAnswer('activity', value)}/>
        )}</View>;
      case lastStep:
        return <>
          <TextInput multiline editable={!saving} accessibilityLabel="Alimentation"
            placeholder="Alimentation (facultatif)" placeholderTextColor={muted}
            selectionColor={blue} style={[styles.input, styles.multiline]}
            value={answers.diet ?? ''} onChangeText={value => updateAnswer('diet', value)}/>
          <TextInput multiline editable={!saving} accessibilityLabel="Note générale"
            placeholder="Note générale (facultatif)" placeholderTextColor={muted}
            selectionColor={blue} style={[styles.input, styles.multiline]} value={note} onChangeText={setNote}/>
        </>;
    }
  }

  const controls = step === null ? null : <>
    <Button label="Retour" disabled={saving} onPress={() => step === 0 ? (onExit ?? reset)() : goTo(step - 1)}/>
    <Button label={step === lastStep ? 'Passer et enregistrer' : 'Passer'} disabled={saving} onPress={skip}/>
    {step === lastStep
      ? <Button label="Enregistrer" active disabled={saving} onPress={() => void submit(false)}/>
      : <Button label="Suivant" active disabled={step === 1 && !category} onPress={() => goTo(step + 1)}/>}
  </>;

  useFocusEffect(useCallback(() => {
    if (!controls) return;
    setWizardControls(controls);
    return () => setWizardControls(null);
  }, [controls, setWizardControls]));

  return <>
    {date && <View>
      <Text style={styles.text}>Heure de l’événement (HH:MM)</Text>
      <TextInput accessibilityLabel="Heure de l’événement" value={hour} onChangeText={setHour}
        editable={!saving} maxLength={5} style={styles.input}/>
    </View>}
    {step === null ? <View style={row}>
      <Button label="Noter un symptôme" active disabled={saving} onPress={onStart ?? (() => goTo(0))}/>
      <Button well icon={Smile} label="Je vais bien" disabled={saving} onPress={() => void submit(true)}/>
    </View> : (
      <View key={step} style={styles.stack}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>Étape {step + 1} sur {steps.length}</Text>
        <Text accessibilityRole="header" style={heading}>{steps[step]}</Text>
        {stepContent()}
      </View>
    )}
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.text}>{error}</Text>}
  </>;
}

const styles = StyleSheet.create({
  text: {color: ink},
  stack: {gap: 8},
  input: {backgroundColor: paper, color: ink, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C8D6E5'},
  multiline: {minHeight: 88, textAlignVertical: 'top'},
});
