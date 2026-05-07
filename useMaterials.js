import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ct_materials';
const UNITS_KEY = 'ct_units';
const PARTIES_CACHE_KEY = 'ct_parties_cache';

export function useMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setMaterials(JSON.parse(stored));
  }, []);

  const addMaterial = (name) => {
    if (!name || name.trim().length < 2) return;
    const trimmed = name.trim();
    setMaterials(prev => {
      if (prev.includes(trimmed)) return prev;
      const updated = [trimmed, ...prev].slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeMaterial = (name) => {
    setMaterials(prev => {
      const updated = prev.filter(m => m !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { materials, addMaterial, removeMaterial };
}

export function useUnits() {
  const DEFAULT_UNITS = ['kg', 'ton', 'piece', 'bundle', 'box', 'meter', 'litre', 'set', 'bag', 'feet', 'inch', 'roll', 'sheet', 'pair', 'dozen'];
  const [units, setUnits] = useState(DEFAULT_UNITS);

  useEffect(() => {
    const stored = localStorage.getItem(UNITS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUnits([...new Set([...DEFAULT_UNITS, ...parsed])]);
    }
  }, []);

  const addUnit = (unit) => {
    if (!unit || unit.trim().length < 1) return;
    const trimmed = unit.trim();
    setUnits(prev => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      const custom = updated.filter(u => !DEFAULT_UNITS.includes(u));
      localStorage.setItem(UNITS_KEY, JSON.stringify(custom));
      return updated;
    });
  };

  return { units, addUnit };
}

export function useDraftForm(key, defaultValues) {
  const [values, setValues] = useState(() => {
    const draft = localStorage.getItem(`draft_${key}`);
    return draft ? { ...defaultValues, ...JSON.parse(draft) } : defaultValues;
  });

  const updateField = (field, value) => {
    setValues(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`draft_${key}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearDraft = () => {
    localStorage.removeItem(`draft_${key}`);
    setValues(defaultValues);
  };

  const setAll = (vals) => {
    setValues(vals);
    localStorage.setItem(`draft_${key}`, JSON.stringify(vals));
  };

  return { values, updateField, clearDraft, setAll };
}
