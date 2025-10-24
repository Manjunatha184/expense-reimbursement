import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const WorkflowProgress = ({ workflow, currentLevel }) => {
  if (!workflow || workflow.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">✓ Auto-approved (No workflow required)</p>
      </div>
    );
  }

  const getStepStatus = (step) => {
    if (step.status === 'approved') {
      return {
        icon: <CheckCircle className="w-6 h-6" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        borderColor: 'border-green-200'
      };
    } else if (step.status === 'rejected') {
      return {
        icon: <XCircle className="w-6 h-6" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <Clock className="w-6 h-6" />,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-200'
      };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 mb-3">Approval Workflow</h3>
      
      <div className="flex items-center gap-4">
        {workflow.map((step, idx) => {
          const status = getStepStatus(step);
          const isActive = step.level === currentLevel;
          
          return (
            <div key={idx} className="flex items-center gap-4">
              {/* Step Card */}
              <div className={`flex-1 p-4 rounded-lg border-2 ${isActive ? 'ring-2 ring-blue-400' : ''} ${status.borderColor} ${status.bgColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`${status.textColor}`}>
                    {status.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {step.level.charAt(0).toUpperCase() + step.level.slice(1)} Level
                    </p>
                    <p className={`text-sm ${status.textColor} font-medium`}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </p>
                    {step.approver && (
                      <p className="text-xs text-gray-600 mt-1">
                        By: {step.approver.name || 'N/A'}
                      </p>
                    )}
                    {step.comments && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        "{step.comments}"
                      </p>
                    )}
                    {step.actionDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(step.actionDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Arrow between steps */}
              {idx < workflow.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Current Stage:</strong> {
            currentLevel === 'completed' 
              ? 'All approvals completed ✓' 
              : `Waiting for ${currentLevel} approval`
          }
        </p>
      </div>
    </div>
  );
};

export default WorkflowProgress;
