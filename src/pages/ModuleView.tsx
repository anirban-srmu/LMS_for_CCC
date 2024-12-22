import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Module, MCQQuestion, CodingExercise } from '../types';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, Code, HelpCircle } from 'lucide-react';

function ModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [codingExercises, setCodingExercises] = useState<CodingExercise[]>([]);
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, number>>({});
  const [mcqResults, setMcqResults] = useState<Record<string, boolean>>({});
  const [code, setCode] = useState('');
  const [currentExercise, setCurrentExercise] = useState<CodingExercise | null>(null);

  useEffect(() => {
    const fetchModuleContent = async () => {
      if (moduleId) {
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .single();

        const { data: mcqData } = await supabase
          .from('mcq_questions')
          .select('*')
          .eq('module_id', moduleId);

        const { data: codingData } = await supabase
          .from('coding_exercises')
          .select('*')
          .eq('module_id', moduleId);

        if (moduleData) setModule(moduleData);
        if (mcqData) setMcqs(mcqData);
        if (codingData) {
          setCodingExercises(codingData);
          if (codingData.length > 0) {
            setCurrentExercise(codingData[0]);
            setCode(codingData[0].initial_code);
          }
        }
      }
    };

    fetchModuleContent();
  }, [moduleId]);

  const handleMcqSubmit = (questionId: string, selectedAnswer: number) => {
    const question = mcqs.find(q => q.id === questionId);
    if (question) {
      const isCorrect = selectedAnswer === question.correct_answer;
      setMcqResults(prev => ({ ...prev, [questionId]: isCorrect }));
      setSelectedMcqAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    }
  };

  const handleCodeSubmit = async () => {
    if (!currentExercise) return;
    
    // In a real application, this would send the code to a backend service
    // for execution and testing. For now, we'll just show a success message.
    alert('Code submitted successfully! In a production environment, this would be evaluated against test cases.');
  };

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading module content...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{module.title}</h2>

        {/* MCQ Section */}
        {mcqs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Multiple Choice Questions</h3>
            <div className="space-y-6">
              {mcqs.map((question) => (
                <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-lg font-medium text-gray-900 mb-4">{question.question}</p>
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleMcqSubmit(question.id, index)}
                        className={`w-full text-left p-3 rounded-lg ${
                          selectedMcqAnswers[question.id] === index
                            ? mcqResults[question.id]
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {mcqResults[question.id] !== undefined && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      mcqResults[question.id] ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        {mcqResults[question.id] ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p className={mcqResults[question.id] ? 'text-green-700' : 'text-red-700'}>
                          {mcqResults[question.id] ? 'Correct!' : 'Incorrect. Try again!'}
                        </p>
                      </div>
                      {!mcqResults[question.id] && (
                        <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coding Exercise Section */}
        {currentExercise && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Coding Exercise</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900">{currentExercise.title}</h4>
                <p className="mt-2 text-gray-600">{currentExercise.description}</p>
              </div>
              
              <div className="mb-4 bg-white rounded-lg overflow-hidden border">
                <Editor
                  height="400px"
                  defaultLanguage={currentExercise.language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                  }}
                />
              </div>

              <button
                onClick={handleCodeSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Code className="h-4 w-4 mr-2" />
                Submit Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModuleView;