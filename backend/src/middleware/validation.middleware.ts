import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = (parsed as any).body;
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.issues) {
        const issues = err.issues || [];
        const message = issues
          .map((i: any) => {
            const field = i.path ? i.path.filter((p: any) => p !== "body").join(".") : "";
            return field ? `${field}: ${i.message}` : i.message;
          })
          .join(", ");
        return res.status(400).json({ error: message || "Validation failed" });
      }
      res.status(400).json({ error: err?.message || "Invalid request" });
    }
  };
};
