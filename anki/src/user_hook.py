from string import Template
from typing import Tuple

from aqt import mw
from anki.hooks import addHook
from aqt.utils import showInfo

from .utils import find_addon_by_name


default_version = 'v0.1'
default_description = '''This is the configuration of how Closet will behave.
To get inspiration you can visit the homepage: closetengine.com.'''
default_name = 'Closet User Code'

script_name = 'ClosetUser'
user_tag = f'{script_name}Tag'
user_id = f'{script_name}Id'

am = find_addon_by_name('Asset Manager')

if am:
    ami = __import__(am).src.lib.interface
    amr = __import__(am).src.lib.registrar

class DoubleTemplate(Template):
    delimiter = '$$'

def indent(line: str, indentation: str) -> str:
    return indentation + line if len(line) > 0 else line

def indent_lines(text: str, indent_size: int) -> str:
    return '\n'.join([
        indent(line, indent_size * ' ')
        for line
        in text.split('\n')
    ])


def get_scripts() -> Tuple[str, str, str]:
    from pathlib import Path
    from os.path import dirname, realpath

    filepath = dirname(realpath(__file__))

    user_filepath = Path(filepath, '..', 'web', 'user.js')
    edit_filepath = Path(filepath, '..', 'web', 'editable.js')
    setup_filepath = Path(filepath, '..', 'web', 'setup.js')

    with open(user_filepath, mode='r', encoding='utf-8') as user_file:
        with open(edit_filepath, mode='r', encoding='utf-8') as edit_file:
            with open(setup_filepath, mode='r', encoding='utf-8') as setup_file:
                return [
                    user_file.read().strip(),
                    edit_file.read().strip(),
                    setup_file.read().strip(),
                ]


def setup_user_script():
    if not am:
        return

    user, edit, setup = get_scripts()

    editWithSetup = DoubleTemplate(edit).substitute(
        setupCode=setup,
    )

    amr.make_and_register_interface(
        tag = user_tag,

        getter = lambda id, storage: ami.make_script(
            storage.name if storage.name is not None else default_name,
            storage.enabled if storage.enabled is not None else True,
            'js',
            storage.version if storage.version is not None else default_version,
            storage.description if storage.description is not None else default_description,
            'into_template',
            storage.conditions if storage.conditions is not None else [],
            storage.code if storage.code is not None else editWithSetup,
        ),

        setter = lambda id, script: True,

        store = ['enabled', 'code', 'version', 'conditions', 'description'],
        readonly = ['name', 'type', 'position'],

        label = lambda id, storage: default_name,

        reset = lambda id, storage: ami.make_script(
            storage.name if storage.name else default_name,
            storage.enabled if storage.enabled else True,
            'js',
            storage.version if storage.version else default_version,
            storage.description if storage.description is not None else default_description,
            'into_template',
            storage.conditions if storage.conditions is not None else [],
            editWithSetup,
        ),

        generator = lambda id, storage, model, tmpl, pos: DoubleTemplate(user).substitute(
            editableCode=indent_lines(storage.code if storage.code is not None else editWithSetup, 4),
            cardType='{{Card}}',
            tagsFull='{{Tags}}',
            side='front' if pos == 'question' else 'back',
        )
    )

def install_user_script():
    if not am:
        return

    pass_meta_script = ami.make_meta_script(
        user_tag,
        f"{script_name}_id",
    )

    # insert the script for every model
    for model_id in mw.col.models.ids():
        amr.register_meta_script(
            model_id,
            pass_meta_script,
        )