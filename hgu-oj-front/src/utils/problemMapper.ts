import { Problem } from '../types';

export const mapProblem = (raw: any): Problem => ({
  id: raw.id,
  displayId: raw.displayId ?? raw._id ?? String(raw.id ?? ''),
  title: raw.title ?? '제목 없음',
  description: raw.description ?? '',
  difficulty: (raw.difficulty as Problem['difficulty']) ?? 'Mid',
  timeLimit: raw.timeLimit ?? raw.time_limit ?? 0,
  memoryLimit: raw.memoryLimit ?? raw.memory_limit ?? 0,
  inputDescription: raw.inputDescription ?? raw.input_description ?? '',
  outputDescription: raw.outputDescription ?? raw.output_description ?? '',
  samples: raw.samples,
  hint: raw.hint,
  createTime: raw.createTime ?? raw.create_time ?? new Date().toISOString(),
  lastUpdateTime: raw.lastUpdateTime ?? raw.last_update_time,
  tags: raw.tags ?? [],
  languages: raw.languages ?? [],
  createdBy: raw.created_by
    ? {
        id: raw.created_by.id,
        username: raw.created_by.username,
        realName: raw.created_by.real_name ?? raw.created_by.realName,
      }
    : raw.createdBy,
  myStatus: raw.my_status ?? raw.myStatus,
  solved: raw.solved,
  submissionNumber: raw.submission_number ?? raw.submissionNumber,
  acceptedNumber: raw.accepted_number ?? raw.acceptedNumber,
  ruleType: raw.rule_type ?? raw.ruleType,
});
