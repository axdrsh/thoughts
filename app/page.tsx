"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, provider, db } from "../config/firebaseConfig";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { PlusIcon, Trash2Icon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Thought {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string;
}

export default function ThoughtKeeper() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user] = useAuthState(auth);
  const postsRef = collection(db, "posts");
  const { toast } = useToast();

  const fetchThoughts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(postsRef);
      const fetchedThoughts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Thought, "id">),
      }));
      setThoughts(fetchedThoughts);
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch thoughts. Please try again.",
        variant: "destructive",
      });
    }
  }, [postsRef]);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  const addThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to add a thought.",
        variant: "destructive",
      });
      return;
    }
    if (title.trim() && content.trim()) {
      try {
        const docRef = await addDoc(postsRef, {
          title: title,
          content: content,
          userId: user.uid,
          username: user.displayName || "Anonymous",
        });
        const newThought: Thought = {
          id: docRef.id,
          title,
          content,
          userId: user.uid,
          username: user.displayName || "Anonymous",
        };
        setThoughts([...thoughts, newThought]);
        setTitle("");
        setContent("");
        toast({
          title: "Success",
          description: "Thought added successfully!",
        });
      } catch (error) {
        console.error("Error adding thought:", error);
        toast({
          title: "Error",
          description: "Failed to add thought. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const deleteThought = async (id: string) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      setThoughts(thoughts.filter((thought) => thought.id !== id));
      toast({
        title: "Success",
        description: "Thought deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting thought:", error);
      toast({
        title: "Error",
        description: "Failed to delete thought. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">thoughts.</h1>

          {!user && (
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              <span>Sign in to use the app.</span>
            </Button>
          )}

          {user && (
            <div className="flex items-center space-x-4">
              <span>{user.displayName}</span>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={handleSignOut}
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>

        {user && (
          <form onSubmit={addThought} className="mb-8 max-w-md mx-auto">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
              <Textarea
                placeholder="Your thought..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full"
              />
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Thought
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thoughts.map((thought) => (
            <Card key={thought.id} className="relative">
              <CardHeader>
                <CardTitle>{thought.title}</CardTitle>
                <CardDescription>by {thought.username}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{thought.content}</p>
              </CardContent>
              <CardFooter>
                {user && user.uid === thought.userId && (
                  <Button
                    onClick={() => deleteThought(thought.id)}
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon className="w-4 h-4" />
                    <span className="sr-only">Delete thought</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
