'use client';
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./react-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Edit, Trash } from "lucide-react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [agendas, setAgendas] = useState<{
    [key: string]: { text: string; completed: boolean; isEditing: boolean }[];
  }>({});
  const [newAgenda, setNewAgenda] = useState("");

  const formatDateKey = (date: Date) =>
    date && new Date(date).toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Load agendas from localStorage on mount
  useEffect(() => {
    const savedAgendas = localStorage.getItem("agendas");
    if (savedAgendas) {
      setAgendas(JSON.parse(savedAgendas));
    }
  }, []);

  // Save agendas to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("agendas", JSON.stringify(agendas));
  }, [agendas]);

  const handleAddAgenda = () => {
    if (selectedDate && newAgenda.trim()) {
      const dateKey = formatDateKey(selectedDate);
      setAgendas((prev) => ({
        ...prev,
        [dateKey]: [
          ...(prev[dateKey] || []),
          { text: newAgenda.trim(), completed: false, isEditing: false },
        ],
      }));
      setNewAgenda("");
    }
  };

  const toggleCompleteAgenda = (dateKey: string, index: number) => {
    setAgendas((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((agenda, i) =>
        i === index ? { ...agenda, completed: !agenda.completed } : agenda
      ),
    }));
  };

  const toggleEditAgenda = (dateKey: string, index: number) => {
    setAgendas((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((agenda, i) =>
        i === index ? { ...agenda, isEditing: !agenda.isEditing } : agenda
      ),
    }));
  };

  const handleEditAgenda = (dateKey: string, index: number, newText: string) => {
    setAgendas((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((agenda, i) =>
        i === index ? { ...agenda, text: newText, isEditing: false } : agenda
      ),
    }));
  };

  const handleRemoveAgenda = (dateKey: string, index: number) => {
    setAgendas((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-8 bg-muted">
      <h1 className="text-3xl font-extrabold text-primary">Agenda Calendar</h1>

      <div className="w-full max-w-xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              onChange={(date) => {
                if (Array.isArray(date)) {
                  setSelectedDate(date[0]);
                } else {
                  setSelectedDate(date);
                }
              }}
              value={selectedDate || new Date()} // Default to a static value
              className="rounded-lg border shadow-md"
            />
          </CardContent>
        </Card>
      </div>

      {selectedDate && (
        <Card className="w-full max-w-xl shadow-lg">
          <CardHeader>
            <CardTitle>
              Agenda for {new Date(selectedDate).toDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="mt-4 space-y-2">
              {agendas[formatDateKey(selectedDate)]?.length > 0 ? (
                agendas[formatDateKey(selectedDate)].map((agenda, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    {agenda.isEditing ? (
                      <Input
                        type="text"
                        defaultValue={agenda.text}
                        onBlur={(e) =>
                          handleEditAgenda(
                            formatDateKey(selectedDate),
                            index,
                            e.target.value
                          )
                        }
                        className="flex-grow"
                      />
                    ) : (
                      <div
                        className={`flex-grow truncate ${
                          agenda.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                        title={agenda.text} // Tooltip to show the full text on hover
                      >
                        {agenda.text}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant={agenda.completed ? "default" : "outline"}
                        onClick={() =>
                          toggleCompleteAgenda(formatDateKey(selectedDate), index)
                        }
                        className="flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden md:inline">
                          {agenda.completed ? "Undo" : "Done"}
                        </span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          toggleEditAgenda(formatDateKey(selectedDate), index)
                        }
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden md:inline">
                          {agenda.isEditing ? "Save" : "Edit"}
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleRemoveAgenda(formatDateKey(selectedDate), index)
                        }
                        className="flex items-center gap-1"
                      >
                        <Trash className="w-4 h-4" />
                        <span className="hidden md:inline">Remove</span>
                      </Button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No agenda for this day.</li>
              )}
            </ul>

            <div className="mt-4 flex gap-2">
              <Input
                type="text"
                value={newAgenda}
                onChange={(e) => setNewAgenda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAgenda()}
                placeholder="Add a new agenda..."
                className="flex-grow"
              />
              <Button
                onClick={handleAddAgenda}
                className="bg-accent text-accent-foreground"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
