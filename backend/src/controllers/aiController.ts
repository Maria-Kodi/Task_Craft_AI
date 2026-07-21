import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

const VALID_PRIORITIES = ['low', 'medium', 'high'];

// @desc    Turn a free-form goal into a task with AI-generated subtasks.
//          This is the "Craft AI" entry point — unlike decomposeTask
//          (which breaks down an existing task), this creates a brand
//          new task from scratch based on a natural-language prompt.
// @route   POST /api/ai/craft
// @access  Private
export const craftFromPrompt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ message: 'Please describe what you want to plan' });
      return;
    }

    const systemPrompt = `You are a task planning assistant inside a productivity app. A user will describe a goal or a vague idea. Turn it into one clear task with a short title, an optional one-sentence description, a priority, and 3 to 5 concrete actionable subtasks.

User's goal: "${prompt.trim()}"

Respond with ONLY valid JSON in this exact shape, no explanation, no markdown:
{"title": "short task title", "description": "one sentence description or empty string", "priority": "low" | "medium" | "high", "subtasks": ["step one", "step two", "step three"]}`;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:latest',
        prompt: systemPrompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const parsed = JSON.parse(data.response);

    const title =
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : prompt.trim().slice(0, 80);
    const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';
    const priority = VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'medium';
    const subtaskTitles: string[] = Array.isArray(parsed.subtasks)
      ? parsed.subtasks.filter((s: unknown) => typeof s === 'string' && s.trim()).slice(0, 6)
      : [];

    // Create the parent task first, then its subtasks, all tagged as AI-generated
    const task = await Task.create({
      title,
      description,
      status: 'todo',
      priority,
      user: req.userId,
      parentTask: null,
      isAIGenerated: true,
    });

    const subtasks = await Promise.all(
      subtaskTitles.map((subtitle) =>
        Task.create({
          title: subtitle,
          status: 'todo',
          user: req.userId,
          parentTask: task._id,
          isAIGenerated: true,
        })
      )
    );

    res.status(201).json({ message: 'Plan created', task, subtasks });
  } catch (error) {
    console.error(`Error in craftFromPrompt: ${error}`);
    res.status(500).json({
      message: 'AI planning failed. Make sure Ollama is running locally (ollama serve).',
    });
  }
};

// @desc    Generate a short morning brief — real stats about the user's
//          active tasks (total, due today, overdue), plus one AI-picked
//          task to focus on first with a brief explanation. Grounded
//          entirely in real due dates and priorities, no invented data.
// @route   GET /api/ai/daily-brief
// @access  Private
export const getDailyBrief = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({
      user: req.userId,
      parentTask: null,
      status: { $ne: 'done' },
    }).sort({ dueDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow
    ).length;
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today).length;

    // Nothing active — return a friendly message without calling the AI at all
    if (tasks.length === 0) {
      res.status(200).json({
        stats: { total: 0, dueToday: 0, overdue: 0 },
        recommendation: "You're all caught up — nothing active on your board right now.",
        focusTask: null,
      });
      return;
    }

    const taskSummaries = tasks
      .slice(0, 12)
      .map(
        (t) =>
          `- "${t.title}" | priority: ${t.priority} | status: ${t.status} | due: ${
            t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : 'none'
          }`
      )
      .join('\n');

    const prompt = `You are a productivity assistant. Here is a list of a user's active tasks:
${taskSummaries}

Pick the ONE task the user should focus on first today, considering due dates (overdue and due-today tasks matter most) and priority (high priority matters more). Then write one short, encouraging sentence explaining the recommendation, addressed directly to the user.

Respond with ONLY valid JSON in this exact shape, no explanation, no markdown:
{"taskTitle": "the exact title of the chosen task, copied exactly as shown above", "recommendation": "one short sentence"}`;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:latest',
        prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const parsed = JSON.parse(data.response);

    const focusTask = tasks.find((t) => t.title === parsed.taskTitle) || tasks[0];
    const recommendation =
      typeof parsed.recommendation === 'string' && parsed.recommendation.trim()
        ? parsed.recommendation.trim()
        : `Start with "${focusTask.title}" — it needs your attention first.`;

    res.status(200).json({
      stats: { total: tasks.length, dueToday, overdue },
      recommendation,
      focusTask,
    });
  } catch (error) {
    console.error(`Error in getDailyBrief: ${error}`);
    res.status(500).json({
      message: 'Could not generate your daily brief. Make sure Ollama is running locally (ollama serve).',
    });
  }
};