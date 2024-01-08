$('#main-search').on('keyup', function(ev){
    fastdom.mutate(() => {
        updateAbilities($(this).val().toLowerCase())
    });
})