"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Edit, Play, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function VoiceSelector() {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [script, setScript] = useState("Hello, how are you?");
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [newScript, setNewScript] = useState(script);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
  });

  // Play sample audio for a voice
  const playSample = (voiceName: string) => {
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.voice = voices.find((v) => v.name === voiceName) || null;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    window.speechSynthesis.speak(utterance);
    setPlayingVoice(voiceName);

    utterance.onend = () => {
      setPlayingVoice(null);
    };
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Get unique languages
  const languages = useMemo(() => {
    const uniqueLangs = new Set(voices.map((voice) => voice.lang));
    return Array.from(uniqueLangs).sort();
  }, [voices]);

  // Filter voices based on search and language
  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      const matchesSearch = voice.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLang = selectedLang === "all" || voice.lang === selectedLang;
      return matchesSearch && matchesLang;
    });
  }, [voices, searchQuery, selectedLang]);

  const handleScriptChange = () => {
    setScript(newScript);
    setIsScriptDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Voice Selector</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              Voice Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScriptDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Change Script
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="pl-9"
            />
          </div>
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredVoices.map((voice) => (
          <Card
            key={voice.name}
            className={`overflow-hidden transition-all ${
              playingVoice === voice.name
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:shadow-md"
            }`}
            onClick={() => playSample(voice.name)}
          >
            <div className="relative aspect-square">
              <img
                src={`https://ui-avatars.com/api/?name=${voice.name}&background=random`}
                alt={voice.name}
                className="object-cover w-full h-full"
              />
              {playingVoice === voice.name && (
                <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{voice.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {voice.lang}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{voice.voiceURI}</p>
            </CardContent>
            <CardFooter className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  playSample(voice.name);
                }}
                disabled={playingVoice === voice.name}
              >
                <Play className="mr-2 h-4 w-4" />
                {playingVoice === voice.name ? "Playing..." : "Preview Voice"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isScriptDialogOpen} onOpenChange={setIsScriptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Script</DialogTitle>
            <DialogDescription>
              Enter the text you want to use for voice previews.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newScript}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewScript(e.target.value)
              }
              placeholder="Enter script text..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScriptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleScriptChange}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>
              Adjust the rate and pitch of the voice.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate</label>
              <div className="flex items-center gap-2">
                <Input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    setVoiceSettings((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  {voiceSettings.rate.toFixed(1)}x
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pitch</label>
              <div className="flex items-center gap-2">
                <Input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) =>
                    setVoiceSettings((prev) => ({
                      ...prev,
                      pitch: parseFloat(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  {voiceSettings.pitch.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
