/**
 * Step 6: Feedback Collection
 * Collects user feedback on AI quality (thumbs up/down + optional comment)
 */

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useAIWizard } from "../ai-wizard";

interface FeedbackStepProps {
  plantName?: string;
  onSubmit?: () => void;
  onSkip?: () => void;
}

export function FeedbackStep({
  plantName = "your plant",
  onSubmit,
  onSkip,
}: FeedbackStepProps) {
  const { state, updateState } = useAIWizard();

  const handleThumbsUp = () => {
    updateState({
      feedbackType: "thumbs_up",
      feedbackComment: "",
    });
  };

  const handleThumbsDown = () => {
    updateState({
      feedbackType: "thumbs_down",
      feedbackComment: "",
    });
  };

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const comment = event.target.value;
    if (comment.length <= 500) {
      updateState({
        feedbackComment: comment,
      });
    }
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  const handleSkip = () => {
    // Reset feedback
    updateState({
      feedbackType: null,
      feedbackComment: "",
    });
    onSkip?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">How helpful was this?</h2>
        <p className="mt-2 text-gray-600">
          Your feedback helps us improve AI recommendations for all users.
        </p>
      </div>

      {/* Plant summary */}
      <div className="rounded-lg bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-900">
          ✓ Plant created successfully
        </p>
        <p className="mt-1 text-green-800">
          <strong>{plantName}</strong> has been added to your collection.
        </p>
      </div>

      {/* Feedback buttons */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          Were the AI-generated care instructions helpful?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleThumbsUp}
            className={`rounded-lg border-2 p-6 transition-all ${
              state.feedbackType === "thumbs_up"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-500 hover:bg-green-50"
            }`}
          >
            <div className="text-4xl">👍</div>
            <p className="mt-2 font-semibold text-gray-900">Yes, helpful!</p>
          </button>

          <button
            type="button"
            onClick={handleThumbsDown}
            className={`rounded-lg border-2 p-6 transition-all ${
              state.feedbackType === "thumbs_down"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-500 hover:bg-red-50"
            }`}
          >
            <div className="text-4xl">👎</div>
            <p className="mt-2 font-semibold text-gray-900">Not helpful</p>
          </button>
        </div>
      </div>

      {/* Optional comment */}
      {state.feedbackType && (
        <div className="space-y-2">
          <Label htmlFor="feedback-comment">
            Additional feedback (optional)
          </Label>
          <Textarea
            id="feedback-comment"
            placeholder="What could be improved? Any issues with the recommendations?"
            value={state.feedbackComment}
            onChange={handleCommentChange}
            rows={4}
          />
          <p className="text-xs text-gray-500">
            {state.feedbackComment.length}/500 characters
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {state.feedbackType && (
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full"
          >
            Submit Feedback
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleSkip}
          className="w-full"
        >
          {state.feedbackType ? "Skip Feedback" : "Skip"}
        </Button>
      </div>

      {/* Info text */}
      <p className="text-center text-xs text-gray-600">
        Your feedback is anonymous and helps improve AI accuracy
      </p>
    </div>
  );
}
