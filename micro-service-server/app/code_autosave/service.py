import app.code_autosave.repository as repo


async def get_code(problem_id, language, userdata, db):
    data = await repo.find_by_problem_id_and_user_id_and_language(problem_id, userdata.username, language, db)
    if not data:
        return ""
    return data.code


def save_code(problem_id, language, userdata, db):
    return None
