import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

const AI_MODE = process.env.AI_MODE || 'local';

const OLLAMA_BASE_URL =
  AI_MODE === 'cloud'
    ? 'https://ollama.com/api'
    : 'http://127.0.0.1:11434/api';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  (AI_MODE === 'cloud' ? 'gpt-oss:20b' : 'gemma4:latest');

function getOllamaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (AI_MODE === 'cloud') {
    if (!process.env.OLLAMA_API_KEY) {
      throw new Error('OLLAMA_API_KEY is missing for cloud mode');
    }

    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  return headers;
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, parentTask } =
      req.body;

    if (!title) {
      res.status(400).json({ message: 'Please provide a task title' });
      return;
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: req.userId,
      parentTask: parentTask || null,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error(`Error in createTask: ${error}`);
    res.status(500).json({
      message: 'Server error while creating task',
    });
  }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(`Error in getTasks: ${error}`);
    res.status(500).json({
      message: 'Server error while fetching tasks',
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      user: req.userId,
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error(`Error in updateTask: ${error}`);
    res.status(500).json({
      message: 'Server error while updating task',
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await Task.deleteMany({
      parentTask: task._id,
      user: req.userId,
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`Error in deleteTask: ${error}`);
    res.status(500).json({
      message: 'Server error while deleting task',
    });
  }
};

// @desc    Break down a task into AI-generated subtasks
// @route   POST /api/tasks/:id/decompose
// @access  Private
export const decomposeTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      user: req.userId,
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const prompt = `You are a task planning assistant.
Break down the following task into exactly 4 short, clear, actionable subtasks.
Each subtask must be something a person can complete.

Task title: "${task.title}"
${task.description ? `Task description: "${task.description}"` : ''}

Respond with ONLY valid JSON. No markdown and no explanation.
Use exactly this structure:
{"subtasks":["first step","second step","third step","fourth step"]}`;

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: 'POST',
      headers: getOllamaHeaders(),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();

      throw new Error(
        `Ollama request failed (${ollamaResponse.status}): ${errorText}`
      );
    }

    const data = await ollamaResponse.json();
    const parsed = JSON.parse(data.response);

    const subtaskTitles: string[] = Array.isArray(parsed.subtasks)
      ? parsed.subtasks
          .filter(
            (title: unknown): title is string =>
              typeof title === 'string' && title.trim().length > 0
          )
          .map((title: string) => title.trim())
          .slice(0, 6)
      : [];

    if (subtaskTitles.length === 0) {
      res.status(502).json({
        message: 'AI did not return usable subtasks',
      });
      return;
    }

    const createdSubtasks = await Promise.all(
      subtaskTitles.map((title) =>
        Task.create({
          title,
          status: 'todo',
          priority: 'medium',
          user: req.userId,
          parentTask: task._id,
          isAIGenerated: true,
        })
      )
    );

    res.status(201).json({
      message: 'Task broken down successfully',
      subtasks: createdSubtasks,
    });
  } catch (error) {
    console.error(`Error in decomposeTask: ${error}`);

    const message =
      AI_MODE === 'cloud'
        ? 'AI break down failed. Check your Ollama Cloud API key and model.'
        : 'AI break down failed. Make sure Ollama is running locally.';

    res.status(500).json({ message });
  }
};