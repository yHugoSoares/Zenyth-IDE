use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};

fn main() {
    let pty_system = NativePtySystem::default();
    let pair = pty_system.openpty(PtySize { rows: 24, cols: 80, pixel_width: 0, pixel_height: 0 }).unwrap();
    let mut master = pair.master;
    let mut writer = master.take_writer().unwrap();
}
